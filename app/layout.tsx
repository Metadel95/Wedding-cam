import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sara & Ahmed — Wedding Camera",
  description: "Capture your moments. You have 10 photos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain-overlay">{children}</body>
    </html>
  );
}
