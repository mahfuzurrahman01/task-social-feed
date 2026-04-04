import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
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
