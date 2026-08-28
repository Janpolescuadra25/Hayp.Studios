import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Geist_Mono, Instrument_Serif } from "next/font/google";
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

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vortex.studio — Ready-Made Digital Products",
  description:
    "An independent digital product studio. Ready-made websites, tools and platforms — designed, engineered and shipped with momentum. No templates, no shortcuts.",
  keywords: [
    "Vortex.studio",
    "Haypbooks",
    "Qyra",
    "Zypra",
    "Cirqa",
    "Lumora",
    "digital products",
    "accounting system",
    "QuickBooks automation",
    "Xero automation",
    "indie studio",
  ],
  authors: [{ name: "Vortex Studios" }],
  openGraph: {
    title: "Vortex.studio — Ready-Made Digital Products",
    description:
      "Ready-made websites, tools and platforms — designed, engineered and shipped with momentum.",
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
        className={`${spaceGrotesk.variable} ${inter.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
