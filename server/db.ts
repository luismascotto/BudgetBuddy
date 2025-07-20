// AI_GENERATED_CODE_START
// [AI Generated] Data: 19/03/2024
// Descrição: Atualização da configuração do banco de dados para PostgreSQL local
// Gerado por: Cursor AI
// Versão: Drizzle ORM 0.39.1, pg 8.11.3

import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });
// AI_GENERATED_CODE_END