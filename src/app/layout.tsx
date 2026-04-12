import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tutor Universitario de Ética y Normativa en Ingenierias del CUTonalá",
  description: "Tutor Universitario Especializado en Casos Académicos y Normativos en el area de ingenierias en el centro universitario de tonalá",
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