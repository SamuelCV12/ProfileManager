import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import ClientDashboard from "./ClientDashboard";
import { getSessionUserId } from "../actions/auth";

export const dynamic = "force-dynamic";

export default async function DashboardCompanyPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/");
  }

  const empresaActiva = await prisma.company.findUnique({
    where: { userId },
    include: {
      vacancies: {
        include: { applications: true }
      }
    }
  });

  if (!empresaActiva) {
    redirect("/");
  }

  const cargosReales = empresaActiva.vacancies.map(v => ({
    id:                    v.id,
    titulo:                v.title,
    descripcion:           v.description,
    salaryRange:           v.salaryRange,
    ubicacion:             empresaActiva.location,
    modalidad:             v.modality as "Remoto" | "Presencial" | "Híbrido",
    isActive:              v.isActive,
    candidatosPostulados:  v.applications.length,
    mustHave:              v.mustHave,
  }));

  return (
    <ClientDashboard
      cargosDisponiblesIniciales={cargosReales}
      companyId={empresaActiva.id}
      companyName={empresaActiva.name}
      companyInitials={empresaActiva.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
    />
  );
}