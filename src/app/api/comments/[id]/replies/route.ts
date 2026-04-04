import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import { createReplySchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// GET /api/comments/[id]/replies — get all replies for a comment
export async function GET(
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

  if (
    comment.post.visibility === "PRIVATE" &&
    comment.post.authorId !== session.userId
  ) {
    return notFoundResponse("Comment");
  }

  const replies = await prisma.reply.findMany({
    where: { commentId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: {
        select: {
          userId: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      },
      _count: { select: { likes: true } },
    },
  });

  const repliesWithLiked = replies.map((r) => ({
    ...r,
    likedByMe: r.likes.some((l) => l.userId === session.userId),
  }));

  return successResponse({ replies: repliesWithLiked });
}

// POST /api/comments/[id]/replies — add a reply
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

  if (
    comment.post.visibility === "PRIVATE" &&
    comment.post.authorId !== session.userId
  ) {
    return notFoundResponse("Comment");
  }

  try {
    const body = await request.json();
    const parsed = createReplySchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      parsed.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return validationErrorResponse(errors);
    }

    const reply = await prisma.reply.create({
      data: {
        content: parsed.data.content,
        commentId,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: true,
        _count: { select: { likes: true } },
      },
    });

    return successResponse({ reply: { ...reply, likedByMe: false } }, 201);
  } catch {
    return errorResponse("Failed to add reply", 500);
  }
}
