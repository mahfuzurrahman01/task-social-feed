import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/api-response";

// GET /api/posts/[id]/likes — list who liked a post
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

  const likes = await prisma.postLike.findMany({
    where: { postId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({ likes: likes.map((l) => l.user) });
}
