/**
 * Shared DB error copy (safe for client + server).
 * Used when production/serverless lacks DATABASE_URL (no PGLite fallback).
 */
export const DATABASE_REQUIRED_MESSAGE =
  "Falta configurar DATABASE_URL (Postgres). Contacta al administrador del despliegue.";
