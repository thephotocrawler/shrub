import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE = "admin_session";

function token() {
  return createHash("sha256")
    .update(`wedding:${process.env.ADMIN_PASSWORD ?? ""}`)
    .digest("hex");
}

export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  return (await cookies()).get(COOKIE)?.value === token();
}

export async function login(password: string) {
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) return false;
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
