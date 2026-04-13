import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Asegúrate de que el alias @ apunte a tu carpeta raíz o usa la ruta relativa
import { getSessionUserId } from "../../../actions/auth";
import PostulacionesClient from "./PostulacionesClient";

export const dynamic = "force-dynamic";

// Definimos la interfaz para que coincida con el comportamiento asíncrono de Next.js
interface Props {
  params: Promise<{ vacancyId: string }>;
}

export default async function PostulacionesPage({ params }: Props) {
  // 1. Resolvemos los params antes de usarlos
  const resolvedParams = await params;
  const vacancyId = resolvedParams.vacancyId;

  // 2. Verificación de sesión
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  // 3. Verificación de empresa vinculada al usuario
  const empresa = await prisma.company.findUnique({ where: { userId } });
  if (!empresa) redirect("/");

  // 4. Búsqueda de la vacante con validación de ID
  if (!vacancyId) redirect("/dashboard-company");

  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId },
    include: { company: true },
  });

  // 5. Validar que la vacante exista y pertenezca a la empresa del usuario
  if (!vacancy || vacancy.companyId !== empresa.id) {
    redirect("/dashboard-company");
  }

  // 6. Obtener las postulaciones vinculadas
  const applicationsDb = await prisma.application.findMany({
    where: { vacancyId: vacancyId },
    include: {
      profile: { 
        include: { user: true } 
      },
    },
    orderBy: { appliedAt: "desc" },
  });

  // 7. Mapeo de datos para el cliente
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

  // 8. Cálculo de iniciales de la empresa
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
      vacancySalaryRange={vacancy.salaryRange || "No definido"}
      vacancyMustHave={vacancy.mustHave}
      companyInitials={initials}
      postulaciones={postulaciones}
    />
  );
}