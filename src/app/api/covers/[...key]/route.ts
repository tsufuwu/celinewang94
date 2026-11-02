import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/db";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { key } = await params;
  const objectKey = decodeURIComponent(key.join("/"));

  const env = await getCloudflareEnv();

  if (!env.COVERS_BUCKET) {
    return new NextResponse("R2 Bucket not configured", { status: 404 });
  }

  const object = await env.COVERS_BUCKET.get(objectKey);

  if (!object) {
    return new NextResponse("Image not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new NextResponse(object.body, {
    headers,
  });
}

