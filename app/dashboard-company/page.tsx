// app/dashboard-company/page.tsx
import prisma from "../../lib/prisma";
import ClientDashboard from "./ClientDashboard";

export default async function DashboardCompanyPage() {
  // 1. Buscamos TODOS los perfiles reales en la base de datos
  const perfilesDb = await prisma.profile.findMany({
    include: { user: true }
  });

  // 2. Mapeamos los datos de Prisma a la interfaz de Figma
  const candidatosReales = perfilesDb.map(p => ({
    id: p.id,
    nombre: `${p.firstName} ${p.lastName}`,
    cargo: p.desiredRole || "Profesional Registrado",
    ubicacion: "Colombia", // Puedes añadir este campo al modelo después
    experiencia: p.experience.length > 0 ? p.experience.join(", ") : "Sin experiencia registrada",
    educacion: p.education.length > 0 ? p.education.join(", ") : "Sin educación registrada",
    habilidades: p.skills.length > 0 ? p.skills : ["General"],
    salarioDeseado: 5000000, 
    disponibilidad: "Inmediata" as const,
    resumen: p.description || "El candidato no ha proporcionado una descripción.",
    email: p.user.email,
    telefono: "No registrado"
  }));

  // 3. Buscamos a la empresa y sus vacantes publicadas
  // Por ahora tomamos la primera empresa (Tech Medellín)
  const empresaActiva = await prisma.company.findFirst({
    include: {
      vacancies: {
        include: { applications: true }
      }
    }
  });

  // 4. Mapeamos las vacantes de la empresa a la interfaz de Figma
  const cargosReales = (empresaActiva?.vacancies || []).map(v => ({
  id: v.id,
  titulo: v.title,
  descripcion: v.description,
  salario: 5000000,
  ubicacion: empresaActiva?.location || "Remoto",
  modalidad: v.modality as "Remoto" | "Presencial" | "Híbrido",
  estado: v.isActive ? "Activo" as const : "Pausado" as const,
  candidatosPostulados: v.applications.length,
  mustHave: v.mustHave  // ← agregar esta línea
}));

  // Renderizamos el componente cliente pasándole los datos extraídos de la base de datos
  return (
  <ClientDashboard 
    candidatosIniciales={candidatosReales} 
    cargosDisponiblesIniciales={cargosReales}
    companyId={empresaActiva?.id || ""}
    companyInitials={empresaActiva?.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "EM"}
  />
);
}