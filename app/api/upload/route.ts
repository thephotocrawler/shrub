import { NextResponse } from "next/server";
import { driveConfigured, uploadPending } from "@/lib/drive";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!driveConfigured()) {
    return NextResponse.json({ error: "Uploads are not set up yet." }, { status: 503 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Please choose an image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }
  const name = String(form.get("name") ?? "").slice(0, 60).replace(/[^\w .-]/g, "").trim();
  try {
    await uploadPending(`${name || "Guest"}__${crypto.randomUUID()}.jpg`, file);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed, please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
