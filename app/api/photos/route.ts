import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const result = await cloudinary.search
      .expression("folder:wedding")
      .sort_by("created_at", "desc")
      .max_results(500)
      .execute();

    const photos = result.resources.map((r: { secure_url: string; public_id: string; created_at: string; width: number; height: number }) => ({
      url: r.secure_url,
      publicId: r.public_id,
      createdAt: r.created_at,
      width: r.width,
      height: r.height,
    }));

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("Gallery fetch error:", err);
    return NextResponse.json({ error: "Could not load photos" }, { status: 500 });
  }
}
