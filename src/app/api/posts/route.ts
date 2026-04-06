import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyRequestToken } from "@/lib/auth";
import { createPostSchema } from "@/lib/validations";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api-response";

const PAGE_SIZE = 10;

// GET /api/posts — paginated feed (cursor-based)
export async function GET(request: NextRequest) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { visibility: "PUBLIC" },
        { visibility: "PRIVATE", authorId: session.userId },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: {
        select: { userId: true, user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const hasMore = posts.length > PAGE_SIZE;
  const data = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  const postsWithLiked = data.map((post) => ({
    ...post,
    likedByMe: post.likes.some((l) => l.userId === session.userId),
  }));

  return successResponse({ posts: postsWithLiked, nextCursor });
}

// POST /api/posts — create a post
export async function POST(request: NextRequest) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  try {
    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      parsed.error.issues.forEach((e) => {
        const key = e.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return validationErrorResponse(errors);
    }

    const { content, visibility, imageUrl } = parsed.data;

    const post = await prisma.post.create({
      data: {
        content,
        visibility,
        imageUrl: imageUrl ?? null,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: true,
        _count: { select: { comments: true, likes: true } },
      },
    });

    return successResponse({ post: { ...post, likedByMe: false } }, 201);
  } catch {
    return errorResponse("Failed to create post", 500);
  }
}
