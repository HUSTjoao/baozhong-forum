// prisma.config.ts
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
})
