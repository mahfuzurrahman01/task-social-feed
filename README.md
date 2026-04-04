# Buddy Script

A social feed application built with Next.js 14, PostgreSQL, and Prisma. Users can register, log in, create posts (public or private), like posts, comment, reply, and interact with the community feed.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Bootstrap 5
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (HttpOnly cookies) + bcrypt
- **Validation**: Zod

## Features

- Secure JWT authentication (register / login / logout)
- Protected feed route — only accessible to logged-in users
- Create posts with text and optional image
- Public posts visible to all; private posts visible only to the author
- Like / unlike posts, comments, and replies
- See who liked a post/comment/reply
- Threaded comments and replies
- Dark mode toggle
- Cursor-based pagination (designed for scale)

## Getting Started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your database URL and JWT secret:
   ```bash
   cp .env.example .env
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000`

## Database Design

The schema is designed with scale in mind:
- Indexes on `posts(createdAt DESC)` for fast feed queries
- Separate like tables per entity (PostLike, CommentLike, ReplyLike) with unique constraints to prevent duplicate likes
- Cursor-based pagination on the feed API
- All cascading deletes handled at the DB level via Prisma

## Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT stored in HttpOnly, SameSite=Strict cookies
- All inputs validated with Zod
- Private post visibility enforced at API level, not just UI
- Parameterized queries via Prisma (no SQL injection risk)
