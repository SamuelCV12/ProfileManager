// components/ui/LanguageSelector.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { Languages, ChevronDown, Check, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { Locale } from "../../lib/i18n";

const LANGUAGES: { code: Locale; label: string; flag: string }[] = [
  { code: "es", label: "Español",  flag: "🇨🇴" },
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function LanguageSelector() {
  const { locale, setLocale, isTranslating } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === locale)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={isTranslating}
        className="flex items-center gap-2 border border-black/20 bg-white/60 hover:bg-white/80 transition-colors rounded-lg px-3 py-1.5 text-sm font-medium text-black disabled:opacity-60"
      >
        {isTranslating
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Languages className="w-4 h-4" />}
        <span> {currentLang.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span></span>
                {lang.label}
              </span>
              {locale === lang.code && <Check className="w-4 h-4 text-[#5FD3BC]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}