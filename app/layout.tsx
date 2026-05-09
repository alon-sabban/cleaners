import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getLang } from "@/lib/language";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CleanMatch — Find trusted cleaners in your community",
  description: "Connect with vetted and community-trusted cleaning professionals. Book in minutes.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();
  return (
    <html lang={lang} dir={lang === "he" ? "rtl" : "ltr"}>
      <body className={`${geist.className} bg-white text-gray-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
