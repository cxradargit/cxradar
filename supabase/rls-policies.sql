-- RLS Policies — CXRadar
-- Colunas em camelCase (padrão Prisma sem @map nos campos)

-- ============================================================
-- USUARIOS
-- ============================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_self_access" ON usuarios
  FOR ALL
  USING (id = auth.uid()::text);

-- ============================================================
-- EMPRESAS
-- ============================================================
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "empresas_tenant_isolation" ON empresas
  FOR ALL
  USING (
    id = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
  );

-- ============================================================
-- SURVEYS
-- ============================================================
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "surveys_tenant_isolation" ON surveys
  FOR ALL
  USING (
    "empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
  );

CREATE POLICY "surveys_public_read" ON surveys
  FOR SELECT
  USING (status = 'ATIVA');

-- ============================================================
-- SURVEY_QUESTIONS
-- ============================================================
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_questions_tenant_isolation" ON survey_questions
  FOR ALL
  USING (
    "surveyId" IN (
      SELECT id FROM surveys
      WHERE "empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
    )
  );

CREATE POLICY "survey_questions_public_read" ON survey_questions
  FOR SELECT
  USING (
    "surveyId" IN (SELECT id FROM surveys WHERE status = 'ATIVA')
  );

-- ============================================================
-- SURVEY_RESPONDENTS
-- ============================================================
ALTER TABLE survey_respondents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_respondents_tenant_isolation" ON survey_respondents
  FOR ALL
  USING (
    "surveyId" IN (
      SELECT id FROM surveys
      WHERE "empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
    )
  );

CREATE POLICY "survey_respondents_public_token_read" ON survey_respondents
  FOR SELECT
  USING (true);

-- ============================================================
-- SURVEY_RESPONSES
-- ============================================================
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_responses_tenant_isolation" ON survey_responses
  FOR ALL
  USING (
    "surveyId" IN (
      SELECT id FROM surveys
      WHERE "empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
    )
  );

CREATE POLICY "survey_responses_public_insert" ON survey_responses
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- SURVEY_ANSWERS
-- ============================================================
ALTER TABLE survey_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_answers_tenant_isolation" ON survey_answers
  FOR ALL
  USING (
    "responseId" IN (
      SELECT sr.id FROM survey_responses sr
      JOIN surveys s ON sr."surveyId" = s.id
      WHERE s."empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
    )
  );

CREATE POLICY "survey_answers_public_insert" ON survey_answers
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- ALERTS
-- ============================================================
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alerts_tenant_isolation" ON alerts
  FOR ALL
  USING (
    "surveyId" IN (
      SELECT id FROM surveys
      WHERE "empresaId" = (SELECT "empresaId" FROM usuarios WHERE id = auth.uid()::text)
    )
  );
