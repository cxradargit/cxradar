-- Tabela de canais de disparo (nível plataforma)
CREATE TABLE IF NOT EXISTS canais (
  id        TEXT PRIMARY KEY,          -- 'WHATSAPP' | 'SMS' | 'EMAIL'
  nome      TEXT NOT NULL,
  ativo     BOOLEAN NOT NULL DEFAULT false,
  provedor  TEXT,                       -- 'evolution' | 'twilio' | 'sendgrid' | 'resend'
  config    JSONB NOT NULL DEFAULT '{}' -- credenciais do provedor (SMS/Email)
);

-- Seed com os 3 canais fixos
INSERT INTO canais (id, nome, ativo, provedor, config) VALUES
  ('WHATSAPP', 'WhatsApp', true,  'evolution', '{}'),
  ('SMS',      'SMS',      false, 'twilio',    '{}'),
  ('EMAIL',    'E-mail',   false, 'sendgrid',  '{}')
ON CONFLICT (id) DO NOTHING;

-- Tabela de override por empresa (NULL = herda o global)
CREATE TABLE IF NOT EXISTS empresa_canais (
  "empresaId" TEXT    NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  canal       TEXT    NOT NULL REFERENCES canais(id),
  ativo       BOOLEAN,             -- NULL = herda canais.ativo; TRUE/FALSE = override
  PRIMARY KEY ("empresaId", canal)
);

-- RLS: só service-role acessa canais diretamente (admin usa API route com admin client)
ALTER TABLE canais ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresa_canais ENABLE ROW LEVEL SECURITY;

-- Leitura de empresa_canais pelo próprio tenant
CREATE POLICY "empresa_canais_tenant_read" ON empresa_canais
  FOR SELECT USING (
    "empresaId"::text = (
      SELECT "empresaId"::text FROM usuarios WHERE id = auth.uid()::text
    )
  );
