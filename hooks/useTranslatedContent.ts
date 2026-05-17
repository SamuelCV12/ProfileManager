// hooks/useTranslatedContent.ts
// Hook para traducir contenido dinámico en cualquier componente

import { useState, useEffect, useRef, useId } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTranslationController } from "../context/TranslationController";

export function useTranslatedContent<T extends Record<string, string>>(
  originalContent: T
): { content: T; isTranslating: boolean } {
  const { locale, translateContent } = useLanguage();
  const controller = useTranslationController();
  const [content, setContent] = useState<T>(originalContent);
  const [isTranslating, setIsTranslating] = useState(false);
  const prevLocale = useRef<typeof locale | null>(null);
  const prevContentKey = useRef("");
  const id = useId();

  useEffect(() => {
    const localeChanged = prevLocale.current !== locale;
    const contentKey = JSON.stringify(originalContent);
    const contentChanged = prevContentKey.current !== contentKey;
    prevLocale.current = locale;
    prevContentKey.current = contentKey;

    if (locale === "es") {
      if (localeChanged || contentChanged) setContent(originalContent);
      return;
    }

    if (!localeChanged && !contentChanged) return;

    setIsTranslating(true);

    const promise = controller
      ? controller.requestBatchTranslation(id, originalContent)
      : translateContent(originalContent);

    promise
      .then(translated => setContent(translated as T))
      .catch(() => setContent(originalContent))
      .finally(() => setIsTranslating(false));
  }, [locale, originalContent]);

  return {
    content,
    isTranslating: isTranslating || (controller?.isTranslating ?? false),
  };
}