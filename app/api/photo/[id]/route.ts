import { downloadFile, isApproved } from "@/lib/drive";
import { isAdmin } from "@/lib/admin";

// Streams an image from Drive. Approved photos are public; pending ones only for the admin.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[\w-]{10,}$/.test(id)) return new Response("Not found", { status: 404 });
  try {
    const { exists, approved } = await isApproved(id);
    if (!exists || (!approved && !(await isAdmin()))) {
      return new Response("Not found", { status: 404 });
    }
    const upstream = await downloadFile(id);
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": approved
          ? "public, max-age=86400, s-maxage=86400"
          : "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
