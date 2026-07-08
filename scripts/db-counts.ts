import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  let dbHost = "unknown";
  try {
    dbHost = new URL(connectionString.replace(/^postgresql:/, "http:")).hostname;
  } catch {
    dbHost = "parse-failed";
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const [academies, labs, simulators, modules, activeLabs] = await Promise.all([
      prisma.academy.count(),
      prisma.lab.count(),
      prisma.simulator.count(),
      prisma.learningModule.count(),
      prisma.lab.count({ where: { status: "ACTIVE" } }),
    ]);

    const academyList = await prisma.academy.findMany({
      select: { slug: true, name: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    });

    console.log(
      JSON.stringify({ dbHost, academies, labs, activeLabs, simulators, modules, academyList }, null, 2),
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
