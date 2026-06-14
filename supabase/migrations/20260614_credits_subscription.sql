-- Assinatura de créditos de disparo (separada da assinatura de plano)
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS "stripeCreditsSubscriptionId" TEXT,
  ADD COLUMN IF NOT EXISTS "creditosMensais"             DECIMAL(10,2);
