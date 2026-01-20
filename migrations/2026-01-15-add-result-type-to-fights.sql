-- ============================================================
-- Migration: Add result type to fights
-- Date: 2026-01-15
-- Description: Adds result_type_code field to properly store
--              draw, no contest, and fighter win results
-- ============================================================

USE ufc_analytics;

-- ============================================================
-- 1. ADD RESULT TYPE CODE FIELD
-- ============================================================
ALTER TABLE fact_fights
ADD COLUMN IF NOT EXISTS result_type_code VARCHAR(20) NULL AFTER winner_id,
ADD INDEX IF NOT EXISTS idx_result_type_code (result_type_code);

-- ============================================================
-- 2. UPDATE EXISTING DATA
-- ============================================================
-- Set result_type_code based on existing winner_id
UPDATE fact_fights
SET result_type_code = CASE
    WHEN winner_id IS NULL THEN NULL  -- Pending or unknown
    WHEN fight_result_id = 3 THEN 'draw'
    WHEN fight_result_id = 4 THEN 'no_contest'
    ELSE 'fighter_win'
END
WHERE result_type_code IS NULL;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Column added: fact_fights.result_type_code
-- Possible values: 'fighter_win', 'draw', 'no_contest', NULL (pending)
-- ============================================================
