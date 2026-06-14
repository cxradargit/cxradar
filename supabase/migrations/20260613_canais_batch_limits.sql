-- Limites de disparo por canal (configuráveis pelo super admin)
ALTER TABLE canais
  ADD COLUMN IF NOT EXISTS "batchSize"    INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS "delayMs"      INTEGER NOT NULL DEFAULT 3000,
  ADD COLUMN IF NOT EXISTS "limiteDiario" INTEGER NOT NULL DEFAULT 500;
