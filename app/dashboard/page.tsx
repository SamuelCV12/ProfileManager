// app/dashboard/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { calculateMatchScore } from "../../lib/match";
import ClientDashboard from "./ClientDashboard";
import { getSessionUserId } from "../actions/auth";
import { applyToVacancy } from "../actions/apply";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: { user: true }
  });

  if (!profile) {
    return <div className="p-8 text-center text-gray-500 font-medium">Perfil no encontrado.</div>;
  }

  const allVacancies = await prisma.vacancy.findMany({
    include: { company: true }
  });

  const myApplications = await prisma.application.findMany({
    where: { profileId: profile.id },
    include: { vacancy: { include: { company: true } } }
  });

  const appliedVacancyIds = new Set(myApplications.map(app => app.vacancyId));

  // ── AUTO-POSTULAMIENTO: vacantes con 100% de match no postuladas aún ──
  const autoPostuladas: string[] = [];

  const recommendedJobs = await Promise.all(
    allVacancies
      .filter(v => v.isActive)
      .map(async v => {
        const matchScore = calculateMatchScore(profile, v);

        // Si match = 100 y no está postulado → auto-postular en servidor
        if (matchScore === 100 && !appliedVacancyIds.has(v.id)) {
          const result = await applyToVacancy(v.id, profile.id);
          if (result.success) {
            appliedVacancyIds.add(v.id);
            autoPostuladas.push(v.title); // Guardar título para notificar al cliente
          }
        }

        return {
          id:          v.id,
          title:       v.title,
          company:     v.company.name,
          location:    v.company.location,
          modalidad:   v.modality,
          salarioMin:  v.salaryRange || 0,
          salaryRange: v.salaryRange,
          description: v.description,
          matchScore,
          mustHave:    v.mustHave,
          isApplied:   appliedVacancyIds.has(v.id),
          isActive:    v.isActive,
        };
      })
  );

  // Ordenar por match descendente
  recommendedJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Re-fetch postulaciones para incluir las recién auto-postuladas
  const updatedApplications = await prisma.application.findMany({
    where: { profileId: profile.id },
    include: { vacancy: { include: { company: true } } }
  });

  return (
    <ClientDashboard
      profile={profile}
      vacantes={recommendedJobs}
      postulaciones={updatedApplications}
      autoPostuladas={autoPostuladas}
    />
  );
}