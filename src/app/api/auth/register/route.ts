import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// 5 registrations per hour per IP
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!checkRateLimit(`register:${ip}`, REGISTER_LIMIT, REGISTER_WINDOW_MS)) {
    return errorResponse("Too many registration attempts. Please try again later.", 429);
  }

  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      parsed.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return validationErrorResponse(errors);
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("An account with this email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = successResponse(
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      201
    );

    response.cookies.set(AUTH_COOKIE.name, token, AUTH_COOKIE.options);
    return response;
  } catch {
    return errorResponse("Something went wrong. Please try again.", 500);
  }
}
