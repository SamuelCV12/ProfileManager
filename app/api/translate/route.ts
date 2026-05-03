// app/api/translate/route.ts
// Traduce contenido dinámico de la BD usando Gemini

import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  fr: "French",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { texts, targetLocale } = body;

    if (!texts || !targetLocale || targetLocale === "es") {
      return NextResponse.json({ translations: texts });
    }

    const langName = LANG_NAMES[targetLocale];
    if (!langName) {
      return NextResponse.json({ translations: texts });
    }

    // Construir prompt con todos los textos en un solo JSON
    const prompt = `Translate the following JSON values to ${langName}.
Keep all JSON keys exactly as they are.
Only translate the values, not the keys.
Preserve technical terms, proper nouns, company names, and skill names (React, Node.js, PostgreSQL, etc.) as-is.
Return ONLY a valid JSON object, no markdown, no explanation.

Input:
${JSON.stringify(texts, null, 2)}`;

    const rawResponse = await callGemini(prompt);
    
    let translations: Record<string, string>;
    try {
      const clean = rawResponse.replace(/```json|```/g, "").trim();
      translations = JSON.parse(clean);
    } catch {
      // Si falla el parse, devolver originales
      return NextResponse.json({ translations: texts });
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("Error en translate:", error);
    // Siempre devolver algo válido para no romper la app
    return NextResponse.json({ translations: {} });
  }
}