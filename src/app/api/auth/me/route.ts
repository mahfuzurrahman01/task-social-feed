import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) return unauthorizedResponse();

  return successResponse({ user });
}
