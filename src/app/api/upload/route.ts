import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verifyRequestToken } from "@/lib/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return errorResponse("No file provided");

    if (!ALLOWED_TYPES.includes(file.type)) {
      return errorResponse("Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    if (file.size > MAX_SIZE_BYTES) {
      return errorResponse("File size must be under 5MB");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename — strip path traversal chars, keep extension
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeName = `${Date.now()}-${session.userId}.${ext}`;

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, safeName), buffer);

    const imageUrl = `/uploads/${safeName}`;
    return NextResponse.json({ success: true, data: { imageUrl } }, { status: 201 });
  } catch {
    return errorResponse("Upload failed", 500);
  }
}
