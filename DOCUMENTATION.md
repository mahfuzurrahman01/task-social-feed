# BuddyScript — Project Documentation

## What I Built

BuddyScript is a full-stack social media feed application built with **Next.js 15 (App Router)**, **PostgreSQL**, and **Prisma ORM**. It converts the provided HTML/CSS templates (Login, Register, Feed) into a fully functional web application with authentication, real-time post interactions, and image uploads.

The project is live at: **[https://buddyscript.vercel.app](https://buddyscript.vercel.app)**
GitHub repository: **[https://github.com/YOUR_USERNAME/buddyscript](https://github.com/YOUR_USERNAME/buddyscript)**

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack with API routes + SSR, no need for a separate backend |
| Language | TypeScript | Type safety across frontend and backend |
| Database | PostgreSQL (Neon cloud) | Relational data fits the social graph model; Neon provides serverless Postgres |
| ORM | Prisma v7 | Type-safe queries, clean migrations, works with Neon via `@prisma/adapter-pg` |
| Auth | JWT via `jose` + HttpOnly cookies | Stateless, scalable, secure against XSS |
| Password hashing | bcryptjs (cost factor 12) | Industry-standard one-way hashing |
| Validation | Zod v4 | Schema validation on both input and output |
| Image uploads | Cloudinary | Serverless-compatible — Vercel has a read-only filesystem |
| Styling | Bootstrap 5 + provided custom CSS | Matches reference design exactly |
| Deployment | Vercel | Zero-config Next.js deployment |

---

## Features Implemented

### 1. Authentication & Authorization
- **Register**: first name, last name, email, password (validated with Zod)
- **Login**: email + password, returns a signed JWT stored in an HttpOnly `Secure` cookie (`bs_token`, 7-day expiry)
- **Protected routes**: All feed API endpoints verify the JWT on every request
- **Logout**: Clears the cookie server-side
- **Route guard**: Unauthenticated users visiting `/feed` are redirected to `/login`

### 2. Feed Page
- Displays posts newest-first
- **Cursor-based pagination** — efficient for large datasets ("Load more" button)
- Only PUBLIC posts are shown to all users; PRIVATE posts are visible only to their author
- All post interactions (like, comment, reply) update optimistically in the UI

### 3. Posts
- Create a post with text content, visibility (Public/Private), and optional image
- Delete your own post
- Like / unlike a post (toggle)
- View who liked a post (modal)

### 4. Comments & Replies
- Add comments to any visible post
- Like / unlike a comment
- Reply to a comment (nested one level)
- Like / unlike a reply
- Comment and reply counts update in real time after interaction

### 5. Image Uploads
- Upload JPEG, PNG, GIF, or WebP images (max 5MB)
- Magic bytes validation — file extension alone is not trusted
- Uploaded to Cloudinary; only the CDN URL is stored in the database
- Rate-limited: 20 uploads per user per hour

### 6. Dark Mode
- Toggle on the right side of the page (matches reference design)
- Adds `._dark_wrapper` class to `<body>`, activating all dark-mode CSS rules from the provided stylesheet
- Preference persisted in `localStorage`

---

## Architecture & Key Decisions

### Database Design

```
User
 ├── Post (authorId)
 │    ├── PostLike (userId, postId) — unique constraint prevents double-likes
 │    └── Comment (authorId, postId)
 │         ├── CommentLike (userId, commentId)
 │         └── Reply (authorId, commentId)
 │              └── ReplyLike (userId, replyId)
```

**Indexes added for scale:**
- `Post`: `(createdAt DESC)`, `(visibility, createdAt DESC)`, `(authorId)`
- `PostLike`: `(postId)`
- `Comment`: `(postId)`, `(createdAt DESC)`
- `Reply`: `(commentId)`, `(createdAt DESC)`
- Unique composite indexes on all like join tables prevent duplicate likes at the database level

### JWT Authentication (Stateless)
I chose JWT over session-based auth because:
- No session store needed — scales horizontally without shared state
- The token is stored in an **HttpOnly, Secure, SameSite=Strict** cookie — inaccessible to JavaScript (XSS-safe) and protected against CSRF
- 7-day expiry balances security and UX

### Cursor-based Pagination
Standard offset pagination (`LIMIT x OFFSET y`) degrades at scale because the database must scan and skip rows. Cursor-based pagination (`WHERE id < cursor`) is O(log n) with an index regardless of dataset size — appropriate for "millions of posts."

### Private Post Visibility
The feed query uses an `OR` condition:
```
WHERE visibility = 'PUBLIC'
  OR (visibility = 'PRIVATE' AND authorId = currentUserId)
```
This is enforced at the database level, not in application code, so it cannot be bypassed. Every API route that accesses a single post re-checks this condition independently.

### Image Upload Security
Three layers of validation on every upload:
1. **MIME type check** — only `image/jpeg`, `image/png`, `image/gif`, `image/webp` allowed
2. **File size limit** — 5MB maximum
3. **Magic bytes validation** — reads the first few bytes of the binary to confirm the actual file type matches the declared MIME type, preventing disguised uploads (e.g. a `.php` file renamed to `.jpg`)

### Rate Limiting
An in-memory sliding-window rate limiter protects:
- Login endpoint: 10 attempts per 15 minutes per IP
- Upload endpoint: 20 uploads per hour per user

For a production system at scale, this would be replaced with Redis-backed rate limiting (e.g. Upstash) to work across multiple server instances.

### Security Headers
Set via `next.config.ts` on all routes:
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-DNS-Prefetch-Control: off`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, sets cookie |
| POST | `/api/auth/logout` | Clears cookie |
| GET | `/api/auth/me` | Returns current user |
| GET | `/api/posts` | Paginated feed (cursor-based) |
| POST | `/api/posts` | Create a post |
| DELETE | `/api/posts/[id]` | Delete own post |
| POST | `/api/posts/[id]/like` | Toggle like on a post |
| GET | `/api/posts/[id]/likes` | List users who liked a post |
| GET | `/api/posts/[id]/comments` | Get all comments for a post |
| POST | `/api/posts/[id]/comments` | Add a comment |
| POST | `/api/comments/[id]/like` | Toggle like on a comment |
| GET | `/api/comments/[id]/replies` | Get replies for a comment |
| POST | `/api/comments/[id]/replies` | Add a reply to a comment |
| POST | `/api/replies/[id]/like` | Toggle like on a reply |
| POST | `/api/upload` | Upload image to Cloudinary |

All endpoints return a consistent JSON shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "message", "statusCode": 4xx }
```

---

## Project Structure

```
src/
├── app/
│   ├── api/              # All API route handlers
│   ├── feed/             # Feed page (protected)
│   ├── login/            # Login page
│   └── register/         # Register page
├── components/
│   ├── feed/             # PostCard, CreatePost, CommentSection, etc.
│   └── layout/           # Navbar, Sidebar, DarkModeToggle
├── lib/
│   ├── auth.ts           # JWT sign/verify, cookie helpers
│   ├── prisma.ts         # PrismaClient singleton with Neon adapter
│   ├── rate-limit.ts     # In-memory sliding-window rate limiter
│   ├── validations.ts    # Zod schemas
│   └── api-response.ts   # Standardized response helpers
└── types/                # TypeScript interfaces
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Demo data (3 users, 5 posts, comments, likes)
```

---

## Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/buddyscript.git
cd buddyscript

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

# 4. Push database schema
npx prisma db push

# 5. Seed demo data
npm run db:seed

# 6. Start development server
npm run dev
```

**Demo accounts (after seeding):**
- `john@example.com` / `Password123!`
- `jane@example.com` / `Password123!`
- `radovan@example.com` / `Password123!`

---

## Trade-offs & Future Improvements

| Current | Production improvement |
|---|---|
| In-memory rate limiter | Redis (Upstash) for multi-instance support |
| JWT only (no refresh tokens) | Short-lived access token + refresh token rotation |
| No real-time updates | WebSockets or Server-Sent Events for live like/comment counts |
| Basic avatar (initials) | Profile picture upload |
| Client-side feed polling | SWR / React Query with background refetching |
| Single Cloudinary folder | Separate folders per user, signed upload URLs |
