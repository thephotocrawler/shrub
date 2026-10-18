export const metadata = { title: "Privacy · Shradha & Sourabh" };

export default function Privacy() {
  return (
    <main className="section" style={{ textAlign: "left", maxWidth: 680 }}>
      <h2 style={{ textAlign: "center" }}>Privacy</h2>
      <p>
        This is a personal wedding website for Shradha and Sourabh. It does not use accounts,
        analytics or advertising, and it does not sell or share any information.
      </p>
      <p>
        <b>Photos you upload.</b> When you share photos on the gallery page, we store the photos
        and the name you type. They are reviewed by the couple and only shown publicly once
        approved. Photos are stored in the couple&apos;s Google Drive.
      </p>
      <p>
        <b>Removal.</b> If you would like a photo removed, contact the couple and it will be
        deleted.
      </p>
      <p>
        <b>Google account access.</b> The site uses a Google sign-in belonging to the couple, only
        to save and read the wedding photos in a single Drive folder. Guests are never asked to
        sign in to Google, and the site cannot access any other files.
      </p>
    </main>
  );
}
