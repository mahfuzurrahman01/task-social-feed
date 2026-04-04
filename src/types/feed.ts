export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface PostLikeUser {
  userId: string;
  user: Author;
}

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  author: Author;
  likes: PostLikeUser[];
  likedByMe: boolean;
  _count: { comments: number; likes: number };
}

export interface CommentLikeUser {
  userId: string;
  user: Author;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  likes: CommentLikeUser[];
  likedByMe: boolean;
  _count: { replies: number; likes: number };
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
  likes: Array<{ userId: string; user: Author }>;
  likedByMe: boolean;
  _count: { likes: number };
}
