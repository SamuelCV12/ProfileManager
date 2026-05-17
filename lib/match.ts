import { calcularCompletitud } from "./completitud";

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[-–—/]+/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 0);
}

function skillMatches(skill: string, profileSkills: string[]): boolean {
  const needle = skill.toLowerCase().trim();
  return profileSkills.some(s => {
    const haystack = s.toLowerCase().trim();
    if (haystack === needle) return true;
    if (haystack.startsWith(needle + " ")) return true;
    if (haystack.endsWith(" " + needle)) return true;
    if (haystack.includes(" " + needle + " ")) return true;
    return false;
  });
}

export function calculateMatchScore(profile: any, vacancy: any): number {
  if (!profile || !vacancy) return 0;

  let score = 0;

  // 1. Coincidencia por Cargo (30%) — proporcional por palabras compartidas
  const profileWords = normalizeWords(profile.desiredRole || "");
  const titleWords = normalizeWords(vacancy.title);
  const commonWords = profileWords.filter(w => titleWords.includes(w));
  const maxWords = Math.max(profileWords.length, titleWords.length);
  if (maxWords > 0) {
    score += (commonWords.length / maxWords) * 30;
  }

  // 2. Habilidades Must-Have (40%) — palabra completa, solo contra skills
  const candidateSkills = profile.skills || [];
  let mustHaveMatches = 0;
  vacancy.mustHave?.forEach((skill: string) => {
    if (skillMatches(skill, candidateSkills)) mustHaveMatches++;
  });
  if (vacancy.mustHave?.length > 0) {
    score += (mustHaveMatches / vacancy.mustHave.length) * 40;
  }

  // 3. Bono niceToHave (10%) — skills extra sobre lo requerido
  // Si no hay deseables definidos, se otorga el 10% completo
  if (vacancy.niceToHave?.length > 0) {
    let niceToHaveMatches = 0;
    vacancy.niceToHave.forEach((skill: string) => {
      if (skillMatches(skill, candidateSkills)) niceToHaveMatches++;
    });
    score += (niceToHaveMatches / vacancy.niceToHave.length) * 10;
  } else {
    score += 10;
  }

  // 4. Bono por Perfil Completo (20%)
  const completitudReal = calcularCompletitud(profile, profile?.avatarUrl || null);
  score += (completitudReal / 100) * 20;

  return Math.round(Math.min(score, 100));
}
