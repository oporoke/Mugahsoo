import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3Adapter } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';

const dbPath = process.env.DATABASE_URL;

if (!dbPath) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// The DATABASE_URL is in the format "file:./dev.db"
// better-sqlite3 needs just the path, so we strip "file:".
const sqlite = new Database(dbPath.replace('file:', ''));
const adapter = new PrismaBetterSQLite3Adapter(sqlite);


const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
