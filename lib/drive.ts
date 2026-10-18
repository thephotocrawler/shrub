// Minimal Google Drive REST client (no SDK). Auth = your own account via a refresh token,
// so files are owned by you and use your Drive storage.
const API = "https://www.googleapis.com/drive/v3";

const env = () => ({
  id: process.env.GOOGLE_CLIENT_ID,
  secret: process.env.GOOGLE_CLIENT_SECRET,
  refresh: process.env.GOOGLE_REFRESH_TOKEN,
  pending: process.env.DRIVE_PENDING_FOLDER_ID,
  approved: process.env.DRIVE_APPROVED_FOLDER_ID,
});

export function driveConfigured() {
  return Object.values(env()).every(Boolean);
}

let cached: { token: string; exp: number } | null = null;

async function accessToken() {
  if (cached && cached.exp > Date.now() + 30_000) return cached.token;
  const e = env();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: e.id!,
      client_secret: e.secret!,
      refresh_token: e.refresh!,
      grant_type: "refresh_token",
    }),
  });
  if (!r.ok) throw new Error(`Google auth failed: ${await r.text()}`);
  const j = await r.json();
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

async function call(url: string, init: RequestInit = {}) {
  const r = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${await accessToken()}`, ...init.headers },
  });
  if (!r.ok) throw new Error(`Drive ${r.status}: ${await r.text()}`);
  return r;
}

export type DriveFile = { id: string; name: string };

export async function uploadPending(name: string, file: Blob) {
  const meta = { name, parents: [env().pending] };
  const b = "b" + crypto.randomUUID();
  const body = new Blob([
    `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`,
    `--${b}\r\nContent-Type: image/jpeg\r\n\r\n`,
    file,
    `\r\n--${b}--`,
  ]);
  await call("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${b}` },
    body,
  });
}

export async function listFolder(which: "pending" | "approved"): Promise<DriveFile[]> {
  const q = `'${env()[which]}' in parents and trashed=false`;
  const params = new URLSearchParams({
    q,
    fields: "files(id,name)",
    orderBy: "createdTime desc",
    pageSize: "1000",
  });
  const r = await call(`${API}/files?${params}`);
  return (await r.json()).files ?? [];
}

export async function approvePhoto(id: string) {
  const e = env();
  const params = new URLSearchParams({ addParents: e.approved!, removeParents: e.pending! });
  await call(`${API}/files/${id}?${params}`, { method: "PATCH" });
}

// Goes to the Drive trash (recoverable for 30 days) rather than being deleted outright.
export async function trashPhoto(id: string) {
  await call(`${API}/files/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trashed: true }),
  });
}

export async function isApproved(id: string) {
  const r = await call(`${API}/files/${id}?fields=parents,trashed`);
  const j = await r.json();
  return { exists: !j.trashed, approved: !!j.parents?.includes(env().approved) };
}

export async function downloadFile(id: string) {
  return call(`${API}/files/${id}?alt=media`);
}
