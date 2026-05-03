// prisma/seed.ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando el llenado de la base de datos...");

  // 1. Crear usuario y empresa
  const companyUser = await prisma.user.upsert({
    where: { email: 'rrhh@techmedellin.com' },
    update: {},
    create: {
      email: 'rrhh@techmedellin.com',
      password: 'password123',
      role: 'COMPANY',
      company: {
        create: {
          name: 'Tech Medellín Solutions',
          nit: '900123456-8',
          location: 'Medellín, Colombia',
          coreBusiness: 'Desarrollo de Software a la Medida',
          employeeCount: 50,
        }
      }
    }
  });

  const company = await prisma.company.findUnique({
    where: { userId: companyUser.id }
  });

  if (company) {
    // Limpiar vacantes viejas
    await prisma.vacancy.deleteMany({ where: { companyId: company.id } });

    // 2. Crear vacantes con salaryRange como Int
    await prisma.vacancy.createMany({
      data: [
        {
          companyId:   company.id,
          title:       "Desarrollador Fullstack Junior",
          description: "Buscamos un estudiante apasionado por el desarrollo web moderno con experiencia en React y Next.js.",
          modality:    "Remoto",
          salaryRange: 4000000,
          mustHave:    ["React", "Next.js", "TypeScript", "PostgreSQL"],
          niceToHave:  ["Prisma", "Tailwind CSS"],
          isActive:    true,
        },
        {
          companyId:   company.id,
          title:       "Ingeniero de Sistemas Backend",
          description: "Únete a nuestro equipo para optimizar bases de datos y lógica de negocio en entornos de alta demanda.",
          modality:    "Híbrido",
          salaryRange: 5000000,
          mustHave:    ["Node.js", "SQL", "Java", "Docker"],
          niceToHave:  ["AWS", "Kubernetes"],
          isActive:    true,
        },
        {
          companyId:   company.id,
          title:       "Diseñador UX/UI",
          description: "Encargado de diseñar la experiencia de usuario de nuestros productos digitales.",
          modality:    "Presencial",
          salaryRange: 4000000,
          mustHave:    ["Figma", "Adobe XD", "Prototipado"],
          niceToHave:  ["HTML", "CSS"],
          isActive:    true,
        },
        {
          companyId:   company.id,
          title:       "Analista de Datos",
          description: "Analista para trabajar con grandes volúmenes de información y crear dashboards ejecutivos.",
          modality:    "Híbrido",
          salaryRange: 4500000,
          mustHave:    ["Python", "SQL", "Power BI", "Excel"],
          niceToHave:  ["Tableau", "Machine Learning"],
          isActive:    true,
        },
        {
          companyId:   company.id,
          title:       "DevOps Engineer",
          description: "Responsable de la infraestructura cloud y los pipelines de CI/CD del equipo de ingeniería.",
          modality:    "Remoto",
          salaryRange: 6000000,
          mustHave:    ["Docker", "Kubernetes", "AWS", "Linux"],
          niceToHave:  ["Terraform", "GitHub Actions"],
          isActive:    true,
        }
      ]
    });

    console.log("✅ Empresa y 5 vacantes creadas con éxito.");
  }

  // 3. Crear candidato de prueba
  const existingCandidate = await prisma.user.findUnique({
    where: { email: 'candidato@test.com' }
  });

  if (!existingCandidate) {
    await prisma.user.create({
      data: {
        email:    'candidato@test.com',
        password: 'password123',
        role:     'CANDIDATE',
        profile: {
          create: {
            firstName:   'Carlos',
            lastName:    'Prueba',
            desiredRole: 'Desarrollador Fullstack',
            description: 'Desarrollador con experiencia en React, Node.js y bases de datos relacionales.',
            skills:      ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
            education:   ['Ingeniería de Sistemas | Universidad EAFIT | 2020-2025'],
            experience:  ['Desarrollador Frontend | Startup XYZ | 2023-2024 | Desarrollo de interfaces con React'],
            completitud: 80,
          }
        }
      }
    });
    console.log("✅ Candidato de prueba creado: candidato@test.com / password123");
  } else {
    console.log("ℹ️  Candidato de prueba ya existe, se omite.");
  }

  console.log("🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });