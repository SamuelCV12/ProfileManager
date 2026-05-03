// hooks/useTranslatedContent.ts
// Hook para traducir contenido dinámico en cualquier componente

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

export function useTranslatedContent<T extends Record<string, string>>(
  originalContent: T
): { content: T; isTranslating: boolean } {
  const { locale, translateContent } = useLanguage();
  const [content, setContent] = useState<T>(originalContent);
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLocale = useRef(locale);

  useEffect(() => {
    // Si el idioma no cambió, no hacer nada
    if (prevLocale.current === locale) return;
    prevLocale.current = locale;

    if (locale === "es") {
      // Volver al contenido original en español
      setContent(originalContent);
      return;
    }

    setIsTranslating(true);
    translateContent(originalContent)
      .then(translated => setContent(translated as T))
      .finally(() => setIsTranslating(false));
  }, [locale]);

  return { content, isTranslating };
}