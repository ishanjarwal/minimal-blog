import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadMediaStream } from "@/lib/cloudinary";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export async function POST(request: NextRequest) {
  // Verify admin session
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  // Rate limiting (max 10 uploads per minute per IP)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const rateLimit = checkRateLimit(`media-upload:${ip}`, {
    intervalMs: 60 * 1000,
    maxRequests: 10,
  });

  if (!rateLimit.success) {
    return NextResponse.json(
      { error: `Upload rate limit reached. Retry in ${rateLimit.reset}s.` },
      { status: 429 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum permitted size of 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { secureUrl, publicId } = await uploadMediaStream(buffer);

    return NextResponse.json({
      url: secureUrl,
      publicId,
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload media to Cloudinary" },
      { status: 500 }
    );
  }
}
