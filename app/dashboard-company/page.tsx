import prisma from "../../lib/prisma";
import ClientDashboard from "./ClientDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardCompanyPage() {
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
    telefono: "No registrado"
  }));

  const empresaActiva = await prisma.company.findFirst({
    include: {
      vacancies: {
        include: { applications: true }
      }
    }
  });

  const cargosReales = (empresaActiva?.vacancies || []).map(v => ({
    id: v.id,
    titulo: v.title,
    descripcion: v.description,
    salario: 5000000,
    salaryRange: v.salaryRange,
    ubicacion: empresaActiva?.location || "Remoto",
    modalidad: v.modality as "Remoto" | "Presencial" | "Híbrido",
    estado: v.isActive ? "Activo" as const : "Pausado" as const,
    candidatosPostulados: v.applications.length,
    mustHave: v.mustHave
  }));

  const postulacionesDb = await prisma.application.findMany({
    where: { vacancy: { companyId: empresaActiva?.id } },
    include: {
      profile: { include: { user: true } },
      vacancy: true
    },
    orderBy: { appliedAt: "desc" }
  });

  const postulacionesReales = postulacionesDb.map(a => ({
    id: a.id,
    status: a.status,
    candidatoNombre: `${a.profile.firstName} ${a.profile.lastName}`,
    candidatoEmail: a.profile.user.email,
    candidatoHabilidades: a.profile.skills,
    vacancyTitle: a.vacancy.title,
    appliedAt: a.appliedAt.toISOString()
  }));

  return (
    <ClientDashboard
      candidatosIniciales={candidatosReales}
      cargosDisponiblesIniciales={cargosReales}
      postulacionesIniciales={postulacionesReales}
      companyId={empresaActiva?.id || ""}
      companyName={empresaActiva?.name || "Mi Empresa"}
      companyInitials={empresaActiva?.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "EM"}
    />
  );
}