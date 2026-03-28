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

  const allVacancies = await prisma.vacancy.findMany({
    where: { isActive: true },
    include: { company: true }
  });

  const myApplications = await prisma.application.findMany({
    where: { profileId: profile.id },
    include: { vacancy: { include: { company: true } } }
  });

  const appliedVacancyIds = myApplications.map(app => app.vacancyId);

  const recommendedJobs = allVacancies.map(v => {
    let salarioMin = 0;
    if (v.salaryRange) {
      const match = v.salaryRange.match(/(\d+(\.\d+)?)/);
      if (match) {
        salarioMin = parseFloat(match[0]);
        if (v.salaryRange.toUpperCase().includes("M")) salarioMin *= 1000000;
      }
    }

    const matchScore = calculateMatchScore(profile, v);

    return {
      id: v.id,
      title: v.title,
      company: v.company.name,
      location: v.company.location,
      modalidad: v.modality,
      salarioMin,
      salaryRange: v.salaryRange,
      description: v.description,
      matchScore,
      mustHave: v.mustHave,
      isApplied: appliedVacancyIds.includes(v.id),
      isUrgent: matchScore >= 80,
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