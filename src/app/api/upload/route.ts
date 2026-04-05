import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { verifyRequestToken } from "@/lib/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// 20 uploads per hour per user
const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

/** Validate actual file bytes against known magic numbers to prevent MIME spoofing. */
function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === "image/gif") {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }
  if (mimeType === "image/webp") {
    // RIFF....WEBP
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  const session = await verifyRequestToken(request);
  if (!session) return unauthorizedResponse();

  if (!checkRateLimit(`upload:${session.userId}`, UPLOAD_LIMIT, UPLOAD_WINDOW_MS)) {
    return errorResponse("Upload limit reached. Please try again later.", 429);
  }

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

    // Validate actual file bytes — prevent MIME type spoofing
    if (!validateMagicBytes(buffer, file.type)) {
      return errorResponse("File content does not match the declared image type");
    }

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
