import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Pinyon_Script } from "next/font/google";import "./globals.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--serif" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--script" });

export const metadata: Metadata = {
  title: "Shradha & Sourabh",
  description: "We cordially invite you to the wedding ceremony of Shradha & Sourabh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${script.variable}`}>
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/gallery">Gallery</Link>
        </nav>
        {children}
        <footer>
          Designed &amp; built by Sourabh
          <span> · Want one for your big day? <a href="mailto:ovrtxhq@gmail.com">ovrtxhq@gmail.com</a></span>
        </footer>
      </body>
    </html>
  );
}
