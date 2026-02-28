import type { Metadata } from "next";
import "./globals.css";
import CursorTrail from "./components/CursorTrail";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Paynexus — Payment Infrastructure for the AI Era",
  description:
    "Compliance-first AI-native payment processor and Merchant of Record built for the AI era. GNN-powered risk engine, MCP integration, and zero-friction global payments.",
  keywords: [
    "payment processor",
    "merchant of record",
    "AI payments",
    "compliance",
    "fintech",
    "MCP",
    "IBM watsonx",
  ],
  icons: {
    icon: [
      { url: "/Paynexus-favicon/favicon.ico" },
      { url: "/Paynexus-favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/Paynexus-favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/Paynexus-favicon/apple-touch-icon.png" }],
  },
  manifest: "/Paynexus-favicon/site.webmanifest",
  openGraph: {
    title: "Paynexus — Payment Infrastructure for the AI Era",
    description:
      "Compliance-first AI-native payment processor and Merchant of Record. GNN-powered risk engine with IBM watsonx integration.",
    type: "website",
    images: [{ url: "/Paynexus-logo.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased flex flex-col min-h-screen">
        <CursorTrail />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
