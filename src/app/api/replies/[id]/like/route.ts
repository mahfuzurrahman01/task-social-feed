import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// POST /api/replies/[id]/like — toggle like/unlike on a reply
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: replyId } = await params;

  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    include: { comment: { include: { post: true } } },
  });
  if (!reply) return notFoundResponse("Reply");

  if (
    reply.comment.post.visibility === "PRIVATE" &&
    reply.comment.post.authorId !== session.userId
  ) {
    return notFoundResponse("Reply");
  }

  const existing = await prisma.replyLike.findUnique({
    where: { userId_replyId: { userId: session.userId, replyId } },
  });

  if (existing) {
    await prisma.replyLike.delete({
      where: { userId_replyId: { userId: session.userId, replyId } },
    });
    const count = await prisma.replyLike.count({ where: { replyId } });
    return successResponse({ liked: false, likeCount: count });
  } else {
    await prisma.replyLike.create({
      data: { userId: session.userId, replyId },
    });
    const count = await prisma.replyLike.count({ where: { replyId } });
    return successResponse({ liked: true, likeCount: count });
  }
}

// GET /api/replies/[id]/like — who liked this reply
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: replyId } = await params;

  const reply = await prisma.reply.findUnique({ where: { id: replyId } });
  if (!reply) return notFoundResponse("Reply");

  const likes = await prisma.replyLike.findMany({
    where: { replyId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ likes: likes.map((l) => l.user) });
}
