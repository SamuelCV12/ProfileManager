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
export function calculateMatchScore(profile: any, vacancy: any) { // Aquí se podrían definir tipos más específicos para profile y vacancy en lugar de usar "any" para mayor seguridad de tipo.
  if (!profile || !vacancy) return 0; // Si no hay perfil o vacante, el score es 0
  let score = 0; // Inicializamos el score en 0

  // 1. Coincidencia por Cargo (30%) - por palabras clave
  const profileWords = profile.desiredRole?.toLowerCase().split(" ") || []; // Convertimos el desiredRole en un array de palabras
  const titleWords = vacancy.title.toLowerCase().split(" "); // Convertimos el título de la vacante en un array de palabras
  if (profileWords.some((word: string) => word.length > 3 && titleWords.includes(word))) {   // Si alguna palabra clave del desiredRole coincide con el título de la vacante, otorgamos los puntos completos
    score += 30;
  }

  // 2. Habilidades Must-Have (50%) - skills + education + experience
  const candidateSkills = [ // Combinamos skills, education y experience en un solo array de habilidades del candidato
    ...( profile.skills || []),
    ...(profile.education || []),
    ...(profile.experience || [])
  ].join(" ").toLowerCase(); // Convertimos todo a una sola cadena para facilitar la búsqueda de palabras clave

  let matches = 0;
  vacancy.mustHave.forEach((skill: string) => { // Para cada habilidad must-have de la vacante, verificamos si el candidato la tiene en su conjunto de habilidades/educación/experiencia
    if (candidateSkills.includes(skill.toLowerCase())) matches++; // Si el candidato tiene esa habilidad, incrementamos el contador de matches
  });

  if (vacancy.mustHave.length > 0) { // Si la vacante tiene habilidades must-have listadas, calculamos el porcentaje de coincidencia y lo convertimos a puntos (hasta 50)
    score += (matches / vacancy.mustHave.length) * 50; // Si el candidato tiene todas las habilidades must-have, obtiene los 50 puntos completos. Si tiene la mitad, obtiene 25 puntos, etc.
  }

  // 3. Bono por Perfil Completo (20%)
  score += (profile.completitud / 100) * 20; // Si el perfil está 100% completo, obtiene los 20 puntos completos. Si está al 50%, obtiene 10 puntos, etc.

  return Math.round(score);
}