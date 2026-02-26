import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearScan AI | Fruit Quality Comparison",
  description: "Industrial fruit ripeness comparison using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen bg-black antialiased">{children}</body>
    </html>
  );
}
