import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { AuthHeader } from "@/components/AuthHeader";
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
      <body className="min-h-screen bg-black antialiased">
        <ClerkProvider>
          <AuthHeader />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
