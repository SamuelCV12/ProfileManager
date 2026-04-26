// lib/gemini.ts
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Llama a Gemini con PDF (base64) o texto plano
export async function callGemini(prompt: string, pdfBase64?: string, plainText?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada en .env");

  const parts: any[] = [];

  if (pdfBase64) {
    // Modo PDF: enviar el archivo directamente
    parts.push({
      inline_data: {
        mime_type: "application/pdf",
        data: pdfBase64,
      },
    });
  } else if (plainText) {
    // Modo texto: el contenido extraído del Word/otro
    parts.push({ text: `Aquí está el contenido del CV:\n\n${plainText}\n\n` });
  }

  parts.push({ text: prompt });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}