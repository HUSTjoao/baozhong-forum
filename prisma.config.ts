// prisma.config.ts
import "dotenv/config"
import { defineConfig } from "prisma/config"

const isLocal = process.env.DATABASE_PROVIDER !== "postgresql"

export default defineConfig({
  schema: isLocal ? "prisma/schema.local.prisma" : "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: isLocal
      ? "file:./prisma/dev.db"
      : process.env.DATABASE_URL,
  },
})
