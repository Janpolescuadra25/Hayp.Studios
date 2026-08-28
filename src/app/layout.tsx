import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortex.studio — Ready-Made Websites & Digital Tools",
  description:
    "A solo-founded digital product studio. Ready-made websites and digital tools — all designed and built exclusively by the founder. No outsourcing, no shortcuts.",
  keywords: [
    "Vortex.studio",
    "digital products",
    "ready-made websites",
    "web templates",
    "SaaS",
    "e-commerce",
    "portfolio",
    "solo founder",
  ],
  authors: [{ name: "Vortex Studios" }],
  openGraph: {
    title: "Vortex.studio — Ready-Made Websites & Digital Tools",
    description:
      "Ready-made websites and digital tools — all designed and built exclusively by the founder.",
    siteName: "Vortex.studio",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
