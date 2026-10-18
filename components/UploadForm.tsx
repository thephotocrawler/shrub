"use client";
import { useState } from "react";

// Resize in the browser so phone photos fit under Vercel's request size limit.
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not read image"))), "image/jpeg", 0.85)
  );
}

export default function UploadForm() {
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "");
    const files = (form.elements.namedItem("files") as HTMLInputElement).files;
    if (!files?.length) return;
    setStatus("busy");
    try {
      for (const f of Array.from(files)) {
        const body = new FormData();
        body.set("name", name);
        body.set("file", new File([await shrink(f)], "photo.jpg", { type: "image/jpeg" }));
        const r = await fetch("/api/upload", { method: "POST", body });
        if (!r.ok) throw new Error((await r.json()).error ?? "Upload failed");
      }
      setStatus("done");
      setMsg("Thank you! Your photos will appear once approved.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="upload">
      <input name="name" placeholder="Your name" required maxLength={60} />
      <input name="files" type="file" accept="image/*" multiple required />
      <button disabled={status === "busy"}>{status === "busy" ? "Uploading…" : "Share photos"}</button>
      {msg && <p className={status === "error" ? "err" : "ok"}>{msg}</p>}
    </form>
  );
}
