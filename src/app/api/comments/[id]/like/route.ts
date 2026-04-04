import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// POST /api/comments/[id]/like — toggle like/unlike on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: commentId } = await params;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });
  if (!comment) return notFoundResponse("Comment");

  // Block if the parent post is private and user isn't the author
  if (
    comment.post.visibility === "PRIVATE" &&
    comment.post.authorId !== session.userId
  ) {
    return notFoundResponse("Comment");
  }

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId: session.userId, commentId } },
  });

  if (existing) {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId: session.userId, commentId } },
    });
    const count = await prisma.commentLike.count({ where: { commentId } });
    return successResponse({ liked: false, likeCount: count });
  } else {
    await prisma.commentLike.create({
      data: { userId: session.userId, commentId },
    });
    const count = await prisma.commentLike.count({ where: { commentId } });
    return successResponse({ liked: true, likeCount: count });
  }
}

// GET /api/comments/[id]/like — who liked this comment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: commentId } = await params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return notFoundResponse("Comment");

  const likes = await prisma.commentLike.findMany({
    where: { commentId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ likes: likes.map((l) => l.user) });
}
