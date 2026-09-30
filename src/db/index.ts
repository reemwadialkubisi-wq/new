import "server-only";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { mkdirSync } from "node:fs";
import path from "node:path";
import * as schema from "./schema";
import { seed, seedRoutine } from "./seed";

export type DB = BetterSQLite3Database<typeof schema>;

/** Where the data lives: data/reem.db inside the app folder, unless DATABASE_PATH says otherwise. */
export function databasePath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "reem.db");
}

const g = globalThis as unknown as { __reemDb?: DB };

/** Opens the local database once, applies any new migrations and seeds a fresh one. */
export function getDb(): DB {
  if (g.__reemDb) return g.__reemDb;
  const file = databasePath();
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  seed(db);
  seedRoutine(db);
  g.__reemDb = db;
  return db;
}
