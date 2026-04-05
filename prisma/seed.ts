import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // ── Users ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const john = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      firstName: "John",
      lastName: "Carter",
      email: "john@example.com",
      passwordHash,
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: "jane@example.com" },
    update: {},
    create: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      passwordHash,
    },
  });

  const radovan = await prisma.user.upsert({
    where: { email: "radovan@example.com" },
    update: {},
    create: {
      firstName: "Radovan",
      lastName: "SkillArena",
      email: "radovan@example.com",
      passwordHash,
    },
  });

  // ── Posts ────────────────────────────────────────────────────────────
  const post1 = await prisma.post.create({
    data: {
      authorId: john.id,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.",
      visibility: "PUBLIC",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: jane.id,
      content:
        "Just had an amazing lunch with the team! 🍜 Building great products starts with great people. Grateful for this crew every single day.",
      visibility: "PUBLIC",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: radovan.id,
      content:
        "Excited to announce our new project launch next week! Stay tuned for updates on what we've been building behind the scenes.",
      visibility: "PUBLIC",
    },
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: john.id,
      content:
        "Web performance tip: always lazy-load images below the fold. A simple change that can cut your LCP by 40% or more. Have you tried it?",
      visibility: "PUBLIC",
    },
  });

  const post5 = await prisma.post.create({
    data: {
      authorId: jane.id,
      content:
        "Reading 'Clean Code' for the third time and still finding new things. Some books just never get old. What's your go-to tech book?",
      visibility: "PUBLIC",
    },
  });

  // ── Comments ─────────────────────────────────────────────────────────
  const comment1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: radovan.id,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: jane.id,
      content: "Totally agree! Great insight.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: john.id,
      content: "This is so true. Thanks for sharing!",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: radovan.id,
      content: "Couldn't agree more. Well said.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: jane.id,
      content: "This post is gold. Sharing with my team!",
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: john.id,
      content: "What a great team you have! Keep up the amazing work.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: radovan.id,
      content: "Looks like an awesome place to work!",
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: jane.id,
      content: "Can't wait to see what you've been building! Super excited.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: radovan.id,
      content: "Great tip! We applied this last sprint and saw huge improvement.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post5.id,
      authorId: john.id,
      content: "Clean Code is a classic. Also recommend 'The Pragmatic Programmer'!",
    },
  });

  // ── Replies ──────────────────────────────────────────────────────────
  await prisma.reply.create({
    data: {
      commentId: comment1.id,
      authorId: john.id,
      content: "Exactly my thoughts! Glad you mentioned this.",
    },
  });

  await prisma.reply.create({
    data: {
      commentId: comment2.id,
      authorId: jane.id,
      content: "Thank you so much! We really appreciate it.",
    },
  });

  // ── Likes ────────────────────────────────────────────────────────────
  await prisma.postLike.createMany({
    data: [
      { userId: jane.id, postId: post1.id },
      { userId: radovan.id, postId: post1.id },
      { userId: john.id, postId: post2.id },
      { userId: radovan.id, postId: post2.id },
      { userId: jane.id, postId: post3.id },
      { userId: john.id, postId: post3.id },
      { userId: jane.id, postId: post4.id },
      { userId: radovan.id, postId: post5.id },
    ],
    skipDuplicates: true,
  });

  await prisma.commentLike.createMany({
    data: [
      { userId: john.id, commentId: comment1.id },
      { userId: jane.id, commentId: comment1.id },
      { userId: radovan.id, commentId: comment2.id },
      { userId: john.id, commentId: comment3.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed complete.");
  console.log("   Users: john@example.com / jane@example.com / radovan@example.com");
  console.log("   Password: Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
