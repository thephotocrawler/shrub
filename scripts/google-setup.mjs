// One-time setup: signs in to your Google account, creates the "pending" and "approved"
// folders in your Drive, and prints the values to put in .env.local / Vercel.
//
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... npm run google-setup
import http from "node:http";
import { exec } from "node:child_process";

const id = process.env.GOOGLE_CLIENT_ID;
const secret = process.env.GOOGLE_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first (see README).");
  process.exit(1);
}

const redirect = "http://localhost:3456/callback";
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: id,
    redirect_uri: redirect,
    response_type: "code",
    // drive.file = only files/folders this app creates. It can't see the rest of your Drive.
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
  });

const code = await new Promise((resolve) => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, redirect);
    if (url.pathname !== "/callback") return res.end();
    res.end("Done! You can close this tab and go back to the terminal.");
    server.close();
    resolve(url.searchParams.get("code"));
  });
  server.listen(3456, () => {
    console.log("Opening your browser. If it doesn't open, visit:\n\n" + authUrl + "\n");
    exec(`${process.platform === "win32" ? 'start ""' : "open"} "${authUrl}"`);
  });
});

const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    client_id: id,
    client_secret: secret,
    redirect_uri: redirect,
    grant_type: "authorization_code",
  }),
});
const tokens = await tokenRes.json();
if (!tokens.refresh_token) {
  console.error("No refresh token received:", tokens);
  process.exit(1);
}

async function makeFolder(name, parent) {
  const r = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${tokens.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parent && { parents: [parent] }),
    }),
  });
  const j = await r.json();
  if (!j.id) throw new Error(JSON.stringify(j));
  return j.id;
}

const root = await makeFolder("Wedding Photos");
const pending = await makeFolder("pending", root);
const approved = await makeFolder("approved", root);

console.log("\nAdd these to .env.local and to Vercel > Settings > Environment Variables:\n");
console.log(`GOOGLE_CLIENT_ID=${id}`);
console.log(`GOOGLE_CLIENT_SECRET=${secret}`);
console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
console.log(`DRIVE_PENDING_FOLDER_ID=${pending}`);
console.log(`DRIVE_APPROVED_FOLDER_ID=${approved}`);
console.log('\nA "Wedding Photos" folder now exists in your Drive.');
