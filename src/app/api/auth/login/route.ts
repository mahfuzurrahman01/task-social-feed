import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// 10 attempts per 15 minutes per IP
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(`login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS)) {
    return errorResponse("Too many login attempts. Please try again later.", 429);
  }

  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      parsed.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return validationErrorResponse(errors);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    // Use constant-time comparison to prevent timing attacks
    const dummyHash =
      "$2a$12$dummyhashfortimingattackprevention.padding.padding";
    const passwordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash);

    if (!user || !passwordMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = successResponse({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      },
    });

    response.cookies.set(AUTH_COOKIE.name, token, AUTH_COOKIE.options);
    return response;
  } catch {
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
