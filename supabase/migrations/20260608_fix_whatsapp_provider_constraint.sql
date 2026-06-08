-- Adiciona EVOLUTION_GO ao check constraint de whatsappProvider
ALTER TABLE empresas DROP CONSTRAINT IF EXISTS "empresas_whatsappProvider_check";
ALTER TABLE empresas ADD CONSTRAINT "empresas_whatsappProvider_check"
  CHECK ("whatsappProvider" IN ('ZAPI', 'EVOLUTION', 'EVOLUTION_GO'));
