import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { verifyRequestToken } from "@/lib/auth";
import { unauthorizedResponse, errorResponse } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mimeType === "image/gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  if (mimeType === "image/webp") {
    return (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
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

    if (!validateMagicBytes(buffer, file.type)) {
      return errorResponse("File content does not match the declared image type");
    }

    // Upload to Cloudinary via base64 data URI
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "buddyscript",
      public_id: `${Date.now()}-${session.userId}`,
      overwrite: false,
    });

    return NextResponse.json(
      { success: true, data: { imageUrl: result.secure_url } },
      { status: 201 }
    );
  } catch {
    return errorResponse("Upload failed", 500);
  }
}
