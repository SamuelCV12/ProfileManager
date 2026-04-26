// app/api/ai/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/app/actions/auth";
import { callClaude } from "@/lib/gemini";
import { calculateMatchScore } from "@/lib/match";
import prisma from "@/lib/prisma";

const MATCH_SYSTEM = `Eres un experto en selección de talento humano.
Tu tarea es analizar el ajuste entre un candidato y una vacante de trabajo.
Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni markdown.`;

function buildMatchPrompt(profile: any, vacancy: any): string {
  return `Analiza el ajuste entre este candidato y esta vacante.

PERFIL DEL CANDIDATO:
- Rol deseado: ${profile.desiredRole || "No especificado"}
- Habilidades: ${profile.skills?.join(", ") || "No especificadas"}
- Educación: ${profile.education?.join(", ") || "No especificada"}
- Experiencia: ${profile.experience?.join(", ") || "No especificada"}
- Preferencias: ${profile.preferences?.join(", ") || "No especificadas"}

VACANTE:
- Título: ${vacancy.title}
- Descripción: ${vacancy.description || "No disponible"}
- Requisitos (Must Have): ${vacancy.mustHave?.join(", ") || "No especificados"}
- Modalidad: ${vacancy.modality || "No especificada"}
- Ubicación empresa: ${vacancy.company?.location || "No especificada"}
- Salario ofrecido: ${vacancy.salaryRange ? "$" + vacancy.salaryRange : "No especificado"}

Devuelve un JSON con esta estructura exacta:
{
  "semanticScore": número entre 0 y 100,
  "strengths": ["lista de hasta 3 puntos fuertes del candidato para esta vacante"],
  "gaps": ["lista de hasta 3 brechas o aspectos que el candidato no cumple"],
  "recommendation": "Excelente ajuste | Buen ajuste | Ajuste parcial | Bajo ajuste"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { vacancyId } = body;

    if (!vacancyId) {
      return NextResponse.json({ error: "Se requiere vacancyId" }, { status: 400 });
    }

    // Obtener perfil real desde sesión
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
    }

    // Obtener vacante con company (location está en Company, no en Vacancy)
    const vacancy = await prisma.vacancy.findUnique({
      where: { id: vacancyId },
      include: { company: true },
    });

    if (!vacancy) {
      return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
    }

    // 1. Score determinístico
    const algorithmicScore = calculateMatchScore(profile, vacancy);

    // 2. Análisis semántico con Claude (no bloquea si falla)
    let aiAnalysis = null;
    try {
      const rawResponse = await callClaude(
        [{ role: "user", content: buildMatchPrompt(profile, vacancy) }],
        { system: MATCH_SYSTEM, maxTokens: 1024 }
      );
      const clean = rawResponse.replace(/```json|```/g, "").trim();
      aiAnalysis = JSON.parse(clean);
    } catch {
      console.warn("IA no disponible, usando solo score algorítmico");
    }

    // 3. Score final: 70% algorítmico + 30% semántico
    let finalScore = algorithmicScore;
    if (aiAnalysis?.semanticScore !== undefined) {
      finalScore = Math.round(algorithmicScore * 0.7 + aiAnalysis.semanticScore * 0.3);
    }

    // 4. Acción según reglas de negocio
    const action =
      finalScore === 100 ? "auto_apply"
      : finalScore >= 70  ? "suggest_apply"
      : "no_action";

    return NextResponse.json({
      success: true,
      scores: {
        algorithmic: algorithmicScore,
        semantic: aiAnalysis?.semanticScore ?? null,
        final: finalScore,
      },
      action,
      analysis: aiAnalysis
        ? {
            strengths: aiAnalysis.strengths,
            gaps: aiAnalysis.gaps,
            recommendation: aiAnalysis.recommendation,
          }
        : null,
    });
  } catch (error) {
    console.error("Error en match AI:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}