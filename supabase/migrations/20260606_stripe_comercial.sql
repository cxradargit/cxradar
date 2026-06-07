-- Stripe + Modelo Comercial: adiciona billing, saldo e custo por disparo

ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS "saldo"                DECIMAL(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "custoWhatsapp"         DECIMAL(6,4)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "custoSMS"              DECIMAL(6,4)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "custoEmail"            DECIMAL(6,4)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "stripeCustomerId"      TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionId"  TEXT,
  ADD COLUMN IF NOT EXISTS "statusAssinatura"      TEXT NOT NULL DEFAULT 'INATIVA';

-- Histórico de créditos: recargas e consumos
CREATE TABLE IF NOT EXISTS credit_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "empresaId"      UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL,        -- RECARGA | CONSUMO
  canal            TEXT,                 -- WHATSAPP | SMS | EMAIL | null (para recargas)
  valor            DECIMAL(10,2) NOT NULL, -- positivo=recarga, negativo=consumo
  descricao        TEXT,
  "stripeEventId"  TEXT,
  "criadoEm"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE credit_transactions DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_credit_transactions_empresa ON credit_transactions("empresaId");
