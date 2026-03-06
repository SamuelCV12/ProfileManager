import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// 1. Creamos la conexión nativa a PostgreSQL
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL as string
})

// 2. Le pasamos esa conexión al adaptador de Prisma
const adapter = new PrismaPg(pool)

// 3. Inicializamos el cliente con el adaptador (¡Como lo exige Prisma 7!)
const prisma = new PrismaClient({ adapter })

export default async function Home() {
  const vacantes = await prisma.vacancy.findMany()

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-blue-400">
          ¡Prueba Full-Stack Exitosa! 🚀
        </h1>
        <p className="text-lg mb-8">
          Si ves los datos de la base de datos aquí abajo, significa que Next.js, Prisma, Docker y PostgreSQL están funcionando en perfecta armonía.
        </p>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            Datos extraídos de PostgreSQL:
          </h2>
          <pre className="text-sm overflow-x-auto text-yellow-300">
            {JSON.stringify(vacantes, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  )
}