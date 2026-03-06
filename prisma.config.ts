import { defineConfig } from '@prisma/config'
import { config } from 'dotenv'

// Forzar la lectura del archivo .env
config()

export default defineConfig({
  datasource: {
    // Usamos process.env estándar de Node.js
    url: process.env.DATABASE_URL as string
  }
})
