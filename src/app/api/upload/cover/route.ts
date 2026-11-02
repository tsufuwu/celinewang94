import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/db";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const slug = (formData.get("slug") as string) || "cover";

    if (!file) {
      return NextResponse.json({ success: false, message: "Không tìm thấy file ảnh WebP." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${slug.replace(/[^a-z0-9]/gi, "-")}_${Date.now()}.webp`;
    const r2Key = `covers/${fileName}`;

    const env = await getCloudflareEnv();

    // 1. Upload to Cloudflare R2 Bucket if binding exists
    if (env.COVERS_BUCKET) {
      await env.COVERS_BUCKET.put(r2Key, buffer, {
        httpMetadata: {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000, immutable",
        },
      });

      return NextResponse.json({
        success: true,
        url: `/api/covers/${encodeURIComponent(r2Key)}`,
        key: r2Key,
      });
    }

    // 2. Fallback: try saving locally if on Node/Local, otherwise return Base64 data URL for Cloudflare Worker
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "covers");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const localFilePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(localFilePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/covers/${fileName}`,
      });
    } catch {
      // Running on Cloudflare Worker (read-only filesystem) without R2 binding:
      // Return WebP Base64 Data URL directly, safely stored in D1 database
      const base64Data = buffer.toString("base64");
      return NextResponse.json({
        success: true,
        url: `data:image/webp;base64,${base64Data}`,
      });
    }
  } catch (error: unknown) {
    console.error("Cover upload error:", error);
    return NextResponse.json(
      { success: false, message: (error as Error)?.message || "Lỗi upload ảnh." },
      { status: 500 }
    );
  }
}

