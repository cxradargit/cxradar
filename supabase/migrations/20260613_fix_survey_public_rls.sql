-- Fix: drop permissive public-read policies that leak survey data across tenants
--
-- Context: surveys_public_read and survey_questions_public_read were OR'd with
-- tenant isolation, letting any authenticated user read ALL active surveys.
-- The public survey page (/s/[slug]) already uses createAdminClient() and never
-- needed these policies.

DROP POLICY IF EXISTS "surveys_public_read"          ON surveys;
DROP POLICY IF EXISTS "survey_questions_public_read" ON survey_questions;
