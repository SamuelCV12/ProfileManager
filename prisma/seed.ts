// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando el llenado de la base de datos...");

  // 1. Creamos el usuario y la empresa al mismo tiempo
  const companyUser = await prisma.user.upsert({
    where: { email: 'rrhh@techmedellin.com' },
    update: {},
    create: {
      email: 'rrhh@techmedellin.com',
      password: 'password123', // Simulado
      role: 'COMPANY',
      company: {
        create: {
          name: 'Tech Medellín Solutions',
          nit: '900123456-7',
          location: 'Medellín, Colombia',
          coreBusiness: 'Desarrollo de Software a la Medida',
          employeeCount: 50,
        }
      }
    }
  });

  const company = await prisma.company.findUnique({ where: { userId: companyUser.id } });

  if (company) {
    // Limpiamos vacantes viejas por si corres este script varias veces
    await prisma.vacancy.deleteMany({ where: { companyId: company.id } });

    // 2. Creamos 3 vacantes con diferentes perfiles para probar el Scoring
    await prisma.vacancy.createMany({
      data: [
        {
          companyId: company.id,
          title: "Desarrollador Fullstack Junior",
          description: "Buscamos un estudiante apasionado por el desarrollo web moderno.",
          modality: "Remoto",
          salaryRange: "3.5M - 4.5M COP",
          mustHave: ["React", "Next.js", "TypeScript", "PostgreSQL"],
          niceToHave: ["Prisma", "Tailwind CSS"],
          isActive: true,
        },
        {
          companyId: company.id,
          title: "Ingeniero de Sistemas Backend",
          description: "Únete a nuestro equipo para optimizar bases de datos y lógica de negocio.",
          modality: "Híbrido",
          salaryRange: "4M - 6M COP",
          mustHave: ["Node.js", "SQL", "Java", "Lógica"],
          niceToHave: ["Docker", "AWS"],
          isActive: true,
        },
        {
          companyId: company.id,
          title: "Diseñador UX/UI",
          description: "Encargado de diseñar la experiencia de usuario de nuestros productos.",
          modality: "Presencial",
          salaryRange: "3M - 5M COP",
          mustHave: ["Figma", "Adobe XD", "Diseño", "Prototipado"],
          niceToHave: ["HTML", "CSS"],
          isActive: true,
        }
      ]
    });
    console.log("✅ Empresa y 3 vacantes creadas con éxito.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });