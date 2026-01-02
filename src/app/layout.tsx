import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This is crucial for Tailwind to work

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roast My Landing Page",
  description: "Get a brutal critique of your startup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* We add 'bg-zinc-950' here to ensure the whole page 
        background is dark by default, preventing white flashes.
      */}
      <body className={`${inter.className} bg-zinc-950 text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}