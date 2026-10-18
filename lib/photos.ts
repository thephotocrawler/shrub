import { driveConfigured, listFolder } from "./drive";

export type Photo = { id: string; url: string; by: string };

// Files are named "<guest name>__<random id>.jpg" so no database is needed.
export async function getPhotos(which: "pending" | "approved"): Promise<Photo[]> {
  if (!driveConfigured()) return [];
  const files = await listFolder(which);
  return files.map((f) => ({
    id: f.id,
    url: `/api/photo/${f.id}`,
    by: f.name.split("__")[0],
  }));
}
