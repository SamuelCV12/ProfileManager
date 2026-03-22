// components/ui/LanguageSelector.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState("es");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 border border-black/20 bg-white/60 hover:bg-white/80 transition-colors rounded-lg px-3 py-1.5 text-sm font-medium text-black"
      >
        <Languages className="w-4 h-4" />
        {currentLang.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => { setSelectedLang(lang.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-black hover:bg-gray-50 transition-colors"
            >
              {lang.label}
              {selectedLang === lang.code && <Check className="w-4 h-4 text-[#5FD3BC]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}