import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const profiles = await prisma.profile.findMany({ include: { user: true } });
console.log("=== PERFILES ===");
for (const p of profiles) {
  console.log(`Email: ${p.user.email}`);
  console.log(`Nombre: ${p.firstName} ${p.lastName}`);
  console.log(`Cargo deseado: ${p.desiredRole}`);
  console.log(`Skills: ${JSON.stringify(p.skills)}`);
  console.log(`Education: ${JSON.stringify(p.education)}`);
  console.log(`Experience: ${JSON.stringify(p.experience)}`);
  console.log(`Avatar: ${p.avatarUrl}`);
}

const vacs = await prisma.vacancy.findMany({ include: { company: true } });
console.log("\n=== VACANTES ===");
for (const v of vacs) {
  console.log(`Título: ${v.title} (${v.company.name})`);
  console.log(`MustHave: ${JSON.stringify(v.mustHave)}`);
  console.log(`NiceToHave: ${JSON.stringify(v.niceToHave)}`);
}

await prisma.$disconnect();
await pool.end();
