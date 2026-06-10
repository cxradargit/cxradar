-- Security hardening applied 2026-06-10
-- Applied via Supabase MCP (migration: security_hardening_rls_policies)

-- 1. Removed permissive public RLS policies
DROP POLICY IF EXISTS "survey_respondents_public_token_read" ON survey_respondents;
DROP POLICY IF EXISTS "survey_responses_public_insert"       ON survey_responses;
DROP POLICY IF EXISTS "survey_answers_public_insert"         ON survey_answers;

-- 2. Enable RLS on credit_transactions (was DISABLE)
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_transactions_tenant_read" ON credit_transactions
  FOR SELECT USING (
    "empresaId"::text = (
      SELECT "empresaId"::text FROM usuarios WHERE id = auth.uid()::text
    )
  );

-- 3. Enable RLS on audit_logs (was DISABLE) — no policy = blocked for non-service-role
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Recreate SECURITY DEFINER functions with fixed search_path
CREATE OR REPLACE FUNCTION incrementar_saldo(p_empresa_id UUID, p_valor DECIMAL)
  RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  UPDATE empresas SET saldo = saldo + p_valor WHERE id::uuid = p_empresa_id;
$$;

CREATE OR REPLACE FUNCTION decrementar_saldo(p_empresa_id UUID, p_valor DECIMAL)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_saldo DECIMAL;
BEGIN
  SELECT saldo INTO v_saldo FROM empresas WHERE id::uuid = p_empresa_id FOR UPDATE;
  IF v_saldo < p_valor THEN RETURN false; END IF;
  UPDATE empresas SET saldo = saldo - p_valor WHERE id::uuid = p_empresa_id;
  RETURN true;
END;
$$;
