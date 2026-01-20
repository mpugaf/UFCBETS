-- ============================================================
-- Migration: Add display order to fights
-- Date: 2026-01-15
-- Description: Adds display_order field to manage fight
--              display sequence within an event
-- ============================================================

USE ufc_analytics;

-- ============================================================
-- 1. ADD DISPLAY ORDER FIELD
-- ============================================================
ALTER TABLE fact_fights
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 AFTER card_position,
ADD INDEX IF NOT EXISTS idx_display_order (event_id, display_order);

-- ============================================================
-- 2. UPDATE EXISTING DATA WITH SEQUENTIAL ORDER
-- ============================================================
-- Set display_order based on category and card_position
-- Title fights first, then main card, then preliminaries
SET @row_number = 0;
SET @current_event = 0;

UPDATE fact_fights ff
JOIN (
  SELECT
    fight_id,
    @row_number := IF(@current_event = event_id, @row_number + 1, 1) as new_order,
    @current_event := event_id as curr_event
  FROM fact_fights
  ORDER BY event_id,
    CASE
      WHEN fight_category_id = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'title_fight') THEN 1
      WHEN fight_category_id = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'main_card') THEN 2
      ELSE 3
    END,
    card_position ASC
) ordered ON ff.fight_id = ordered.fight_id
SET ff.display_order = ordered.new_order;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Column added: fact_fights.display_order
-- Existing data updated with sequential numbering per event
-- Ordered by: category (title > main > prelims) and card_position
-- ============================================================
