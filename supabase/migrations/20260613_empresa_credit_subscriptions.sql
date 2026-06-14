-- Tabela para múltiplas assinaturas de créditos por empresa
CREATE TABLE IF NOT EXISTS empresa_credit_subscriptions (
  id                     UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  "empresaId"            TEXT         NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  "stripeSubscriptionId" TEXT         NOT NULL UNIQUE,
  "valorMensais"         DECIMAL(10,2) NOT NULL,
  status                 TEXT         NOT NULL DEFAULT 'active',
  "criadoEm"             TIMESTAMPTZ  DEFAULT NOW(),
  "atualizadoEm"         TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ecs_empresa ON empresa_credit_subscriptions ("empresaId");

-- Migrar assinatura existente das empresas que já tinham stripeCreditsSubscriptionId
INSERT INTO empresa_credit_subscriptions ("empresaId", "stripeSubscriptionId", "valorMensais", status)
SELECT id, "stripeCreditsSubscriptionId", COALESCE("creditosMensais", 0), 'active'
FROM empresas
WHERE "stripeCreditsSubscriptionId" IS NOT NULL
ON CONFLICT ("stripeSubscriptionId") DO NOTHING;
