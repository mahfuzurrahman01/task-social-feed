import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// GET /api/posts/[id] — get single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
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
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) return notFoundResponse("Post");

  // Private posts are only visible to the author
  if (post.visibility === "PRIVATE" && post.authorId !== session.userId) {
    return notFoundResponse("Post");
  }

  return successResponse({
    post: { ...post, likedByMe: post.likes.some((l) => l.userId === session.userId) },
  });
}

// DELETE /api/posts/[id] — delete a post (author only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id } = await params;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return notFoundResponse("Post");
  if (post.authorId !== session.userId) {
    return errorResponse("You can only delete your own posts", 403);
  }

  await prisma.post.delete({ where: { id } });
  return successResponse({ message: "Post deleted" });
}
