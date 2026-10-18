import { revalidatePath } from "next/cache";
import { approvePhoto, trashPhoto } from "@/lib/drive";
import { isAdmin, login, logout } from "@/lib/admin";
import { getPhotos, type Photo } from "@/lib/photos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false } };

async function loginAction(fd: FormData) {
  "use server";
  await login(String(fd.get("password") ?? ""));
  revalidatePath("/admin");
}

async function logoutAction() {
  "use server";
  await logout();
  revalidatePath("/admin");
}

const validId = (v: FormDataEntryValue | null) => (/^[\w-]{10,}$/.test(String(v)) ? String(v) : null);

async function approve(fd: FormData) {
  "use server";
  const id = validId(fd.get("id"));
  if (!id || !(await isAdmin())) return;
  await approvePhoto(id);
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

async function remove(fd: FormData) {
  "use server";
  const id = validId(fd.get("id"));
  if (!id || !(await isAdmin())) return;
  await trashPhoto(id);
  revalidatePath("/admin");
  revalidatePath("/gallery");
}

function Tile({ p, pending }: { p: Photo; pending?: boolean }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.url} alt="" />
      <figcaption>{p.by}</figcaption>
      <div className="actions">
        {pending && (
          <form action={approve}>
            <input type="hidden" name="id" value={p.id} />
            <button>Approve</button>
          </form>
        )}
        <form action={remove}>
          <input type="hidden" name="id" value={p.id} />
          <button className="danger">{pending ? "Delete" : "Remove"}</button>
        </form>
      </div>
    </figure>
  );
}

export default async function Admin() {
  if (!(await isAdmin())) {
    return (
      <main className="section">
        <h2>Admin</h2>
        <form action={loginAction} className="upload">
          <input name="password" type="password" placeholder="Password" required />
          <button>Log in</button>
        </form>
      </main>
    );
  }
  const [pending, approved] = await Promise.all([getPhotos("pending"), getPhotos("approved")]);
  return (
    <main className="section">
      <h2>Pending ({pending.length})</h2>
      <form action={logoutAction}>
        <button className="link">Log out</button>
      </form>
      <div className="grid">
        {pending.map((p) => (
          <Tile key={p.id} p={p} pending />
        ))}
      </div>
      <h2>Approved ({approved.length})</h2>
      <div className="grid">
        {approved.map((p) => (
          <Tile key={p.id} p={p} />
        ))}
      </div>
    </main>
  );
}
