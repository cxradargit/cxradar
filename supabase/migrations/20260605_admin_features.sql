-- Super Admin features: status, plan, limits, onboarding, audit logs
-- Run this in your Supabase SQL editor or via CLI

-- Empresa: status, plano, limites, notas, onboarding, responsável
ALTER TABLE empresas
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ATIVA',
  ADD COLUMN IF NOT EXISTS plano TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS "limiteUsuarios" INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS "limitePesquisas" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "limiteRespostasMes" INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS "dataRenovacao" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "notasInternas" TEXT,
  ADD COLUMN IF NOT EXISTS "onboardingStatus" TEXT NOT NULL DEFAULT 'LEAD',
  ADD COLUMN IF NOT EXISTS "responsavelComercial" TEXT;

-- Usuarios: status (ATIVO / SUSPENSO)
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ATIVO';

-- Audit log
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao TEXT NOT NULL,
  "entidadeTipo" TEXT NOT NULL,
  "entidadeId" TEXT NOT NULL,
  "realizadoPor" TEXT NOT NULL,
  metadata JSONB,
  "criadoEm" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_criado_em ON audit_logs("criadoEm" DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entidade ON audit_logs("entidadeTipo", "entidadeId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_realizado_por ON audit_logs("realizadoPor");

-- RLS for audit_logs: super admin only (enforce via API, disable RLS on this table)
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
