import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// POST /api/posts/[id]/like — toggle like/unlike
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return notFoundResponse("Post");

  // Private posts can't be liked by others
  if (post.visibility === "PRIVATE" && post.authorId !== session.userId) {
    return notFoundResponse("Post");
  }

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: session.userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({
      where: { userId_postId: { userId: session.userId, postId } },
    });
    const count = await prisma.postLike.count({ where: { postId } });
    return successResponse({ liked: false, likeCount: count });
  } else {
    await prisma.postLike.create({
      data: { userId: session.userId, postId },
    });
    const count = await prisma.postLike.count({ where: { postId } });
    return successResponse({ liked: true, likeCount: count });
  }
}
