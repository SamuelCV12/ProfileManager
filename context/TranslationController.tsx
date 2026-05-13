// context/TranslationController.tsx
"use client";

import { createContext, useContext, useCallback, useRef, useState, ReactNode } from "react";
import { useLanguage } from "./LanguageContext";

interface PendingEntry {
  texts: Record<string, string>;
  resolve: (translations: Record<string, string>) => void;
  reject: (error: Error) => void;
}

interface TranslationControllerType {
  isTranslating: boolean;
  requestBatchTranslation: (id: string, texts: Record<string, string>) => Promise<Record<string, string>>;
}

const TranslationCtx = createContext<TranslationControllerType | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const pendingRef = useRef<Map<string, PendingEntry>>(new Map());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  const flushBatch = useCallback(async () => {
    const pending = pendingRef.current;
    if (pending.size === 0) return;

    const entries = Array.from(pending.entries());
    pending.clear();

    const combined: Record<string, string> = {};
    const idKeys = new Map<string, string[]>();

    for (const [id, entry] of entries) {
      const keys = Object.keys(entry.texts);
      idKeys.set(id, keys);
      for (const key of keys) {
        combined[`${id}__${key}`] = entry.texts[key];
      }
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: combined, targetLocale: localeRef.current }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status}`);
      }

      const result = await response.json();
      const allTranslations: Record<string, string> = result.translations || {};

      for (const [id, entry] of entries) {
        const keys = idKeys.get(id) || [];
        const translated: Record<string, string> = {};
        for (const key of keys) {
          translated[key] = allTranslations[`${id}__${key}`] ?? entry.texts[key];
        }
        entry.resolve(translated);
      }
    } catch (error) {
      for (const [, entry] of entries) {
        entry.reject(error instanceof Error ? error : new Error("Translation failed"));
      }
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const requestBatchTranslation = useCallback(
    async (id: string, texts: Record<string, string>): Promise<Record<string, string>> => {
      return new Promise((resolve, reject) => {
        pendingRef.current.set(id, { texts, resolve, reject });

        if (!timerRef.current) {
          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            flushBatch();
          }, 0);
        }
      });
    },
    [flushBatch]
  );

  return (
    <TranslationCtx.Provider value={{ isTranslating, requestBatchTranslation }}>
      {children}
    </TranslationCtx.Provider>
  );
}

export function useTranslationController() {
  return useContext(TranslationCtx);
}
