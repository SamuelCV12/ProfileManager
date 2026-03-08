import "dotenv/config"; // <- Esta es la línea mágica que faltaba
import { defineConfig, env } from "@prisma/config"; // O "prisma/config" dependiendo de cómo lo autocompletó tu IDE

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});