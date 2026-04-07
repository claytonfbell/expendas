import { defineConfig, env } from "@prisma/config"
import "dotenv/config"

export default defineConfig({
  schema: "prisma/schema.prisma", // Path to your schema
  datasource: {
    url: env("DATABASE_URL"), // Use environment variables
  },
  migrations: {
    path: "prisma/migrations",
  },
})
