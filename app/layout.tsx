// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { LanguageProvider } from "@/context/LanguageContext";
import { TranslationProvider } from "@/context/TranslationController";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ProfileManager",
  description: "Plataforma de gestión de perfiles y vacantes laborales",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn(geist.variable, geistMono.variable)}>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <TranslationProvider>
            {children}
            <Toaster position="top-center" richColors />
          </TranslationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}