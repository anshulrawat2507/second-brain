import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ToastProvider } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Second Brain - Your Personal Knowledge Base",
  description: "A modern, minimalist knowledge management system for capturing and connecting your ideas.",
  keywords: ["notes", "markdown", "knowledge base", "second brain", "productivity"],
  authors: [{ name: "Second Brain" }],
  manifest: "/manifest.json",
  themeColor: "#a855f7",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Second Brain",
  },
  openGraph: {
    title: "Second Brain",
    description: "A modern, minimalist knowledge management system.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#a855f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        {/* KaTeX CSS for math equations */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
        {/* KaTeX JS */}
        <script
          defer
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
          integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Ber8V3qCSNH3h1xaUezS3qKhJSBpPGUxJBvxT6ng"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
