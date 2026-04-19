import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUserId } from "../../../actions/auth";
import PostulacionesClient from "./PostulacionesClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ vacancyId: string }>;
}

/**
 * Función robusta para formatear el salario
 * Maneja tipos numéricos de Prisma y strings manuales
 */
const formatSalary = (salary: any) => {
  if (salary === null || salary === undefined || salary === "N/A" || salary === "") {
    return "No definido";
  }
  
  // Convertimos a string por seguridad antes del replace
  const salaryStr = String(salary);
  const numericValue = parseInt(salaryStr.replace(/\D/g, ""), 10);
  
  if (isNaN(numericValue)) return salaryStr;

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

export default async function PostulacionesPage({ params }: Props) {
  const resolvedParams = await params;
  const vacancyId = resolvedParams.vacancyId;

  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const empresa = await prisma.company.findUnique({ where: { userId } });
  if (!empresa) redirect("/");

  if (!vacancyId) redirect("/dashboard-company");

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    include: { company: true },
  });

  if (!vacancy || vacancy.companyId !== empresa.id) {
    redirect("/dashboard-company");
  }

  const applicationsDb = await prisma.application.findMany({
    where: { vacancyId: vacancyId },
    include: {
      profile: { 
        include: { user: true } 
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  const postulaciones = applicationsDb.map((a) => ({
    id: a.id,
    status: a.status,
    appliedAt: a.appliedAt.toISOString(),
    candidato: {
      id: a.profile.id,
      nombre: `${a.profile.firstName} ${a.profile.lastName}`,
      email: a.profile.user.email,
      telefono: a.profile.phone || "No registrado",
      cargo: a.profile.desiredRole || "Profesional",
      ubicacion: "Colombia",
      resumen: a.profile.description || "",
      habilidades: a.profile.skills,
      experiencia: a.profile.experience.join(" | "),
      educacion: a.profile.education.join(" | "),
      disponibilidad: "Inmediata" as const,
    },
  }));

  const initials = empresa.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PostulacionesClient
      vacancyId={vacancy.id}
      vacancyTitle={vacancy.title}
      vacancyDescription={vacancy.description}
      vacancyModalidad={vacancy.modality}
      vacancySalaryRange={formatSalary(vacancy.salaryRange)}
      vacancyMustHave={vacancy.mustHave}
      companyInitials={initials}
      postulaciones={postulaciones}
    />
  );
}