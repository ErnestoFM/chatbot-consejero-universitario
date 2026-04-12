import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consejero Universitario",
  description: "Chatbot inteligente para orientación universitaria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Agrega suppressHydrationWarning aquí
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      {/* Y también agrégalo aquí en el body */}
      <body 
        className="h-full flex flex-col bg-[#212121]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}