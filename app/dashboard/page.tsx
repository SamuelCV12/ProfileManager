// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { calculateMatchScore } from "../../lib/recommender";
import ClientDashboard from "./ClientDashboard";
import { getSessionUserId } from "../actions/auth";

export default async function DashboardPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!profile) {
    return <div className="p-8 text-center text-gray-500 font-medium">Perfil no encontrado.</div>;
  }

  // Obtenemos todas las vacantes
  const allVacancies = await prisma.vacancy.findMany({
    include: { company: true }
  });

  const myApplications = await prisma.application.findMany({
    where: { profileId: profile.id },
    include: { 
      vacancy: { 
        include: { company: true } 
      } 
    }
  });

  const appliedVacancyIds = myApplications.map(app => app.vacancyId);

  // Filtramos solo las activas para la pestaña de "Recomendados"
  const recommendedJobs = allVacancies
    .filter(v => v.isActive) 
    .map(v => {
      // ✅ Lógica simplificada: salaryRange ya es un Int
      const salarioMin = v.salaryRange || 0;

      const matchScore = calculateMatchScore(profile, v);

      return {
        id: v.id,
        title: v.title,
        company: v.company.name,
        location: v.company.location,
        modalidad: v.modality,
        salarioMin, // Pasamos el número directamente
        salaryRange: v.salaryRange,
        description: v.description,
        matchScore,
        mustHave: v.mustHave,
        isApplied: appliedVacancyIds.includes(v.id),
        isUrgent: matchScore >= 80,
        isActive: v.isActive,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

  return (
    <ClientDashboard
      profile={profile}
      vacantes={recommendedJobs}
      postulaciones={myApplications}
    />
  );
}