// context/LanguageContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Locale, Translations } from "../lib/i18n";

interface LanguageContextType {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  translateContent: (texts: Record<string, string>) => Promise<Record<string, string>>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [isTranslating, setIsTranslating] = useState(false);

  // Cargar idioma guardado en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pm-locale") as Locale | null;
    if (saved && ["es", "en", "fr"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("pm-locale", newLocale);
  }, []);

  // Traduce un objeto de textos dinámicos usando Gemini
  const translateContent = useCallback(async (
    texts: Record<string, string>
  ): Promise<Record<string, string>> => {
    // Si es español no hay que traducir
    if (locale === "es") return texts;

    // Filtrar textos vacíos
    const nonEmpty = Object.entries(texts).filter(([, v]) => v?.trim());
    if (nonEmpty.length === 0) return texts;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texts: Object.fromEntries(nonEmpty),
          targetLocale: locale,
        }),
      });

      if (!response.ok) return texts; // Si falla, devolver original

      const result = await response.json();
      return { ...texts, ...result.translations };
    } catch {
      return texts; // Si falla, devolver original sin romper la app
    } finally {
      setIsTranslating(false);
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={{
      locale,
      t: translations[locale],
      setLocale,
      translateContent,
      isTranslating,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}