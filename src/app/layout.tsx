import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Debug Duel Arena — The Ultimate Live Coding Battle Platform",
  description:
    "Step into the arena. Share your screen. Battle in real-time. Debug Duel Arena is the esports-style live coding battle platform where developers go head-to-head in debugging, algorithm, and code golf challenges.",
  keywords: [
    "coding battle",
    "live coding",
    "debug challenge",
    "esports coding",
    "programming duel",
    "screen share battle",
    "code arena",
    "competitive programming",
    "debug duel",
  ],
  authors: [{ name: "Debug Duel Arena" }],
  openGraph: {
    title: "Debug Duel Arena — The Ultimate Live Coding Battle Platform",
    description:
      "Step into the arena. Share your screen. Battle in real-time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-void min-h-screen flex flex-col font-body text-text-primary">
        <div className="scan"></div>
        <div className="grain"></div>
        <div className="vignette"></div>
        <main className="flex-grow flex flex-col">{children}</main>
      </body>
    </html>
  );
}
