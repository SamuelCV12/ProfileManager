// lib/recommender.ts
export function calculateMatchScore(profile: any, vacancy: any) {
    if (!profile || !vacancy) return 0;
    let score = 0;
  
    // 1. Coincidencia por Cargo (30%)
    if (vacancy.title.toLowerCase().includes(profile.desiredRole?.toLowerCase())) {
      score += 30;
    }
  
    // 2. Habilidades Must-Have (50%)
    const candidateHistory = [...profile.education, ...profile.experience].join(" ").toLowerCase();
    let matches = 0;
    vacancy.mustHave.forEach((skill: string) => {
      if (candidateHistory.includes(skill.toLowerCase())) matches++;
    });
  
    if (vacancy.mustHave.length > 0) {
      score += (matches / vacancy.mustHave.length) * 50;
    }
  
    // 3. Bono por Perfil Completo (20%)
    score += (profile.completitud / 100) * 20;
  
    return Math.round(score);
  }