import UploadForm from "@/components/UploadForm";
import { getPhotos } from "@/lib/photos";

export const revalidate = 60;
export const metadata = { title: "Gallery · Shradha & Sourabh" };

export default async function Gallery() {
  const photos = await getPhotos("approved");
  return (
    <main className="section">
      <h2>Gallery</h2>
      <p>Got photos from the celebrations? Share them with us!</p>
      <UploadForm />
      <div className="grid">
        {photos.map((p) => (
          <figure key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={`Photo by ${p.by}`} loading="lazy" />
            <figcaption>{p.by}</figcaption>
          </figure>
        ))}
      </div>
      {photos.length === 0 && <p className="muted">No photos yet.</p>}
    </main>
  );
}
