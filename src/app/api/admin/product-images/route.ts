import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/admin-api";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("host");
    if (!host || !origin.endsWith(host)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG and WebP images are allowed" }, { status: 400 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${randomUUID()}.${extension}`;
  const { error } = await auth.service.storage.from("product-images").upload(path, await file.arrayBuffer(), {
    contentType: file.type,
    upsert: false
  });
  if (error) return NextResponse.json({ error: "Unable to upload image" }, { status: 500 });

  const { data } = auth.service.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path });
}
