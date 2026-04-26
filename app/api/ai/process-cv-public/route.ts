// app/api/ai/process-cv-public/route.ts
// Versión pública del procesamiento de CV — usada en el registro (sin sesión)
import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";

const CV_EXTRACTION_PROMPT = `You are a CV parser. Extract information from this CV content.
Reply ONLY with a valid JSON object. No markdown, no code blocks, no explanation.

Use this EXACT structure:

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+57 300 000 0000",
  "desiredRole": "Software Developer",
  "summary": "Brief professional summary here.",
  "skills": ["JavaScript", "React", "Node.js"],
  "education": [
    {
      "degree": "Systems Engineering",
      "institution": "Universidad EAFIT",
      "year": "2021-2026"
    }
  ],
  "experience": [
    {
      "role": "Junior Developer",
      "company": "Tech Company",
      "period": "January 2023 - Present",
      "description": "Developed web applications using React and Node.js."
    }
  ]
}

STRICT RULES:
1. "degree": ONLY the degree name. NOT institution or year.
2. "institution": ONLY the school name. NOT degree or year.
3. "year": ONLY the year/period.
4. "role": ONLY the job title. NOT company or period.
5. "company": ONLY the company name. NOT role or period.
6. "period": ONLY the time period.
7. Empty fields use "" for strings or [] for arrays.
8. Do not invent information not in the document.`;

async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType.includes("wordprocessingml") || mimeType.includes("msword")) {
    try {
      const mammoth = await import("mammoth");
      const result  = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch {
      throw new Error("No se pudo extraer texto del archivo Word.");
    }
  }
  if (mimeType.includes("text/")) return buffer.toString("utf-8");
  throw new Error(`Tipo de archivo no soportado: ${mimeType}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfBase64, fileBase64, mimeType } = body;

    let rawResponse: string;

    if (pdfBase64) {
      rawResponse = await callGemini(CV_EXTRACTION_PROMPT, pdfBase64);
    } else if (fileBase64 && mimeType) {
      const buffer    = Buffer.from(fileBase64, "base64");
      const plainText = await extractTextFromBuffer(buffer, mimeType);
      if (!plainText || plainText.trim().length < 50) {
        return NextResponse.json(
          { error: "No se pudo extraer suficiente texto del archivo. Prueba con un PDF." },
          { status: 400 }
        );
      }
      rawResponse = await callGemini(CV_EXTRACTION_PROMPT, undefined, plainText);
    } else {
      return NextResponse.json({ error: "Se requiere un archivo" }, { status: 400 });
    }

    let extractedData;
    try {
      const clean = rawResponse.replace(/```json|```/g, "").trim();
      extractedData = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Error al parsear respuesta de IA", raw: rawResponse },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: extractedData });
  } catch (error: any) {
    console.error("Error en process-cv-public:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}