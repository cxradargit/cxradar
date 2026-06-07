-- Incrementa saldo de forma atômica (evita race condition em webhooks paralelos)
CREATE OR REPLACE FUNCTION incrementar_saldo(p_empresa_id UUID, p_valor DECIMAL)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE empresas SET saldo = saldo + p_valor WHERE id = p_empresa_id;
$$;

-- Decrementa saldo (usado nos disparos), retorna false se saldo insuficiente
CREATE OR REPLACE FUNCTION decrementar_saldo(p_empresa_id UUID, p_valor DECIMAL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_saldo DECIMAL;
BEGIN
  SELECT saldo INTO v_saldo FROM empresas WHERE id = p_empresa_id FOR UPDATE;
  IF v_saldo < p_valor THEN RETURN false; END IF;
  UPDATE empresas SET saldo = saldo - p_valor WHERE id = p_empresa_id;
  RETURN true;
END;
$$;
