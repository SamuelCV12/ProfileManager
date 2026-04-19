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

  const perfilesDb = await prisma.profile.findMany({ include: { user: true } });

  const candidatosReales = perfilesDb.map(p => ({
    id: p.id,
    nombre: `${p.firstName} ${p.lastName}`,
    cargo: p.desiredRole || "Profesional Registrado",
    ubicacion: "Colombia",
    experiencia: p.experience.length > 0 ? p.experience.join(" • ") : "Sin experiencia registrada",
    educacion: p.education.length > 0 ? p.education.join(" • ") : "Sin educación registrada",
    habilidades: p.skills.length > 0 ? p.skills : ["General"],
    salarioDeseado: 5000000,
    disponibilidad: "Inmediata" as const,
    resumen: p.description || "El candidato no ha proporcionado una descripción.",
    email: p.user.email,
    telefono: p.phone || "No registrado",
  }));

  const cargosReales = empresaActiva.vacancies.map(v => ({
    id: v.id,
    titulo: v.title,
    descripcion: v.description,
    salaryRange: v.salaryRange, 
    ubicacion: empresaActiva.location,
    modalidad: v.modality as "Remoto" | "Presencial" | "Híbrido",
    isActive: v.isActive, 
    candidatosPostulados: v.applications.length,
    mustHave: v.mustHave,
  }));

  const postulacionesDb = await prisma.application.findMany({
    where: { vacancy: { companyId: empresaActiva.id } },
    include: {
      profile: { include: { user: true } },
      vacancy: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  const postulacionesReales = postulacionesDb.map(a => ({
    id: a.id,
    status: a.status,
    candidatoNombre: `${a.profile.firstName} ${a.profile.lastName}`,
    candidatoEmail: a.profile.user.email,
    candidatoHabilidades: a.profile.skills,
    vacancyTitle: a.vacancy.title,
    appliedAt: a.appliedAt.toISOString(),
  }));

  return (
    <ClientDashboard
      candidatosIniciales={candidatosReales}
      cargosDisponiblesIniciales={cargosReales}
      postulacionesIniciales={postulacionesReales}
      companyId={empresaActiva.id}
      companyName={empresaActiva.name}
      companyInitials={empresaActiva.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
    />
  );
}