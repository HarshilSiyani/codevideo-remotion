import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vizmo - Create Stunning Videos in Seconds",
  description:
    "AI-powered video generation. Describe your video and watch it come to life with motion graphics, animations, and professional effects.",
  openGraph: {
    title: "Vizmo - Create Stunning Videos in Seconds",
    description:
      "AI-powered video generation. Describe your video and watch it come to life.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dark-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
