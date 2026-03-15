/**
 * 
 * @param profile  
 * @param vacancy 
 * @returns un score de 0 a 100 indicando qué tan bien el perfil del candidato se ajusta a la vacante.
 * 
 * Criterios de Matching:
 * 1. Coincidencia por Cargo (30%): Se analiza el campo "desiredRole" del perfil y se compara con el título de la vacante. Se otorgan puntos si hay palabras clave coincidentes.
 * 2. Habilidades Must-Have (50%): Se verifica que el candidato tenga las habilidades, educación o experiencia listadas en "mustHave" de la vacante. Se calcula un porcentaje basado en cuántas de esas habilidades tiene el candidato.
 * 3. Bono por Perfil Completo (20%): Se otorga un bono proporcional a la completitud del perfil, incentivando a los candidatos a llenar toda su información.
 * 
 * El resultado final es un número redondeado entre 0 y 100 que representa el grado de ajuste del perfil a la vacante.
 * 
 * Nota: Este algoritmo es una aproximación básica y puede ser mejorado con técnicas más avanzadas como NLP
 */ 
export function calculateMatchScore(profile: any, vacancy: any) {
  if (!profile || !vacancy) return 0;
  let score = 0;

  // 1. Coincidencia por Cargo (30%) - por palabras clave
  const profileWords = profile.desiredRole?.toLowerCase().split(" ") || [];
  const titleWords = vacancy.title.toLowerCase().split(" ");
  if (profileWords.some((word: string) => word.length > 3 && titleWords.includes(word))) {
    score += 30;
  }

  // 2. Habilidades Must-Have (50%) - skills + education + experience
  const candidateSkills = [
    ...( profile.skills || []),
    ...(profile.education || []),
    ...(profile.experience || [])
  ].join(" ").toLowerCase();

  let matches = 0;
  vacancy.mustHave.forEach((skill: string) => {
    if (candidateSkills.includes(skill.toLowerCase())) matches++;
  });

  if (vacancy.mustHave.length > 0) {
    score += (matches / vacancy.mustHave.length) * 50;
  }

  // 3. Bono por Perfil Completo (20%)
  score += (profile.completitud / 100) * 20;

  return Math.round(score);
}