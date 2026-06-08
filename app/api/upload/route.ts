import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data, mimeType } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    // data is already a base64 data URI like "data:image/jpeg;base64,..."
    const base64 = data.includes(",") ? data : `data:${mimeType || "image/jpeg"};base64,${data}`;

    // Rough size check — base64 is ~33% larger than binary, so 13MB base64 ≈ 10MB image
    if (base64.length > 14 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(base64, {
      folder: "wedding",
      transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto:good" }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
