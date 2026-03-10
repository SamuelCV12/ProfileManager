// app/dashboard/page.tsx
export const dynamic = "force-dynamic"; // ✅ Evitamos que Next.js guarde el nombre viejo en caché

import prisma from "../../lib/prisma"; 
import { calculateMatchScore } from "../../lib/recommender";
import ClientDashboard from "./ClientDashboard";

export default async function DashboardPage() {
  // ✅ 1. Buscamos el perfil usando orderBy (igual que en la página de perfil)
  // Ya no buscamos "Samuel", buscamos tu perfil principal consistentemente.
  const profile = await prisma.profile.findFirst({
    orderBy: { id: 'asc' },
    include: { user: true }
  });

  if (!profile) {
    return <div className="p-8 text-center text-gray-500 font-medium">Cargando perfil...</div>;
  }

  // 2. Traemos todas las vacantes
  const allVacancies = await prisma.vacancy.findMany({
    where: { isActive: true },
    include: { company: true }
  });

  // 3. Traemos las postulaciones usando el ID seguro del perfil
  const myApplications = await prisma.application.findMany({
    where: { profileId: profile.id }, 
    include: { vacancy: { include: { company: true } } }
  });
  const appliedVacancyIds = myApplications.map(app => app.vacancyId);

  // 4. Mapeamos datos, calculamos scoring y extraemos el salario numérico
  const recommendedJobs = allVacancies.map(v => {
    let salarioMin = 0;
    if (v.salaryRange) {
      const match = v.salaryRange.match(/(\d+(\.\d+)?)/);
      if (match) {
        salarioMin = parseFloat(match[0]);
        if (v.salaryRange.toUpperCase().includes('M')) salarioMin *= 1000000;
      }
    }

    return {
      id: v.id,
      title: v.title,
      company: v.company.name,
      location: v.company.location,
      modalidad: v.modality,
      salarioMin: salarioMin,
      matchScore: calculateMatchScore(profile, v), // El motor usa tu perfil actualizado
      mustHave: v.mustHave,
      isApplied: appliedVacancyIds.includes(v.id)
    };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // 5. Enviamos los datos listos al Client Component
  return (
    <ClientDashboard 
      profile={profile} 
      vacantes={recommendedJobs} 
      postulaciones={myApplications} 
    />
  );
}