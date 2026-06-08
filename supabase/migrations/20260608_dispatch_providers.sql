-- Colunas de provedor por canal por empresa
-- null = canal não configurado ("Em breve")
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS "whatsappProvider" TEXT,
  ADD COLUMN IF NOT EXISTS "smsProvider"      TEXT,
  ADD COLUMN IF NOT EXISTS "emailProvider"    TEXT;
