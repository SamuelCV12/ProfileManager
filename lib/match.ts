// lib/match.ts
// Algoritmo de match determinístico (tu lógica original preservada y exportada)
// Este archivo es importado por la ruta /api/ai/match

/**
 * Calcula el score de match entre un perfil y una vacante.
 * @param profile
 * @param vacancy
 * @returns un score de 0 a 100 indicando qué tan bien el perfil del candidato se ajusta a la vacante.
 *
 * Criterios de Matching:
 * 1. Coincidencia por Cargo (30%): Se analiza el campo "desiredRole" del perfil y se compara con el título de la vacante.
 * 2. Habilidades Must-Have (50%): Se verifica que el candidato tenga las habilidades listadas en "mustHave" de la vacante.
 * 3. Bono por Perfil Completo (20%): Se otorga un bono proporcional a la completitud del perfil.
 */
export function calculateMatchScore(profile: any, vacancy: any): number {
  if (!profile || !vacancy) return 0;

  let score = 0;

  // 1. Coincidencia por Cargo (30%)
  const profileWords = profile.desiredRole?.toLowerCase().split(" ") || [];
  const titleWords = vacancy.title.toLowerCase().split(" ");
  if (profileWords.some((word: string) => word.length > 3 && titleWords.includes(word))) {
    score += 30;
  }

  // 2. Habilidades Must-Have (50%)
  const candidateSkills = [
    ...(profile.skills || []),
    ...(profile.education || []),
    ...(profile.experience || []),
  ]
    .join(" ")
    .toLowerCase();

  let matches = 0;
  vacancy.mustHave?.forEach((skill: string) => {
    if (candidateSkills.includes(skill.toLowerCase())) matches++;
  });

  if (vacancy.mustHave?.length > 0) {
    score += (matches / vacancy.mustHave.length) * 50;
  }

  // 3. Bono por Perfil Completo (20%)
  score += ((profile.completitud ?? 0) / 100) * 20;

  return Math.round(score);
}