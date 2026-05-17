// lib/completitud.ts
// Función compartida para calcular completitud del perfil

function entradaTieneContenido(arr: string[] | null | undefined): boolean {
  return Array.isArray(arr) && arr.some(e => e.replace(/ \| /g, "").trim() !== "");
}

export function calcularCompletitud(
  data: {
    firstName?: string | null;
    lastName?: string | null;
    desiredRole?: string | null;
    description?: string | null;
    birthDate?: string | Date | null;
    phone?: string | null;
    skills?: string[] | null;
    education?: string[] | null;
    experience?: string[] | null;
  },
  avatarUrl: string | null
): number {
  let score = 0;

  if (data.firstName?.trim())   score += 10;
  if (data.lastName?.trim())    score += 10;
  if (data.desiredRole?.trim()) score += 10;
  if (data.description?.trim()) score += 10;
  if (data.birthDate)           score += 10;
  if (data.phone?.trim())       score += 10;

  if (Array.isArray(data.skills)     && data.skills.length > 0)     score += 10;
  if (entradaTieneContenido(data.education))  score += 10;
  if (entradaTieneContenido(data.experience)) score += 10;

  if (avatarUrl?.trim()) score += 10;

  return Math.min(score, 100);
}
