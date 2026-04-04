import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
} from "@/lib/api-response";

// GET /api/posts/[id]/comments — get all comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return notFoundResponse("Post");

  if (post.visibility === "PRIVATE" && post.authorId !== session.userId) {
    return notFoundResponse("Post");
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
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
      _count: { select: { replies: true, likes: true } },
    },
  });

  const commentsWithLiked = comments.map((c) => ({
    ...c,
    likedByMe: c.likes.some((l) => l.userId === session.userId),
  }));

  return successResponse({ comments: commentsWithLiked });
}

// POST /api/posts/[id]/comments — add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return notFoundResponse("Post");

  if (post.visibility === "PRIVATE" && post.authorId !== session.userId) {
    return notFoundResponse("Post");
  }

  try {
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      parsed.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return validationErrorResponse(errors);
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        postId,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: true,
        _count: { select: { replies: true, likes: true } },
      },
    });

    return successResponse({ comment: { ...comment, likedByMe: false } }, 201);
  } catch {
    return errorResponse("Failed to add comment", 500);
  }
}
