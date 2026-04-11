import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consejero Universitario",
  description: "Chatbot inteligente para orientación universitaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full flex flex-col bg-[#212121]">{children}</body>
    </html>
  );
}
