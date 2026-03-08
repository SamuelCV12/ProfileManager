import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // 1. Creamos el pool de conexión con la URL de tu .env
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Creamos el adaptador (Requisito obligatorio en Prisma 7)
  const adapter = new PrismaPg(pool);
  
  // 3. Instanciamos el cliente con el adaptador y los logs activados
  return new PrismaClient({ 
    adapter,
    log: ['query', 'error', 'warn', 'info'] 
  });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma