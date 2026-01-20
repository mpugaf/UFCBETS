-- ============================================================
-- Migration: Fight Categories
-- Date: 2026-01-14
-- Description: Adds fight categories table to classify fights
--              as preliminary, main card, or title fights
-- ============================================================

USE ufc_analytics;

-- ============================================================
-- 1. CREATE FIGHT CATEGORIES DIMENSION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS dim_fight_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    display_order INT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert fight categories
INSERT INTO dim_fight_categories (category_name, category_code, display_order, description) VALUES
('Preliminares', 'preliminary', 1, 'Peleas preliminares del evento'),
('Cartelera Estelar', 'main_card', 2, 'Peleas de la cartelera principal'),
('Pelea por el Título', 'title_fight', 3, 'Peleas por el campeonato')
ON DUPLICATE KEY UPDATE category_name=category_name;

-- ============================================================
-- 2. ADD CATEGORY REFERENCE TO FACT_FIGHTS
-- ============================================================
ALTER TABLE fact_fights
ADD COLUMN IF NOT EXISTS fight_category_id INT NULL AFTER weight_class_id,
ADD FOREIGN KEY IF NOT EXISTS fk_fight_category (fight_category_id)
  REFERENCES dim_fight_categories(category_id) ON DELETE SET NULL,
ADD INDEX IF NOT EXISTS idx_fight_category (fight_category_id);

-- ============================================================
-- 3. MIGRATE EXISTING DATA
-- ============================================================
-- Set Title Fights
UPDATE fact_fights
SET fight_category_id = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'title_fight')
WHERE is_title_fight = 1;

-- Set Main Card fights (main event and co-main event)
UPDATE fact_fights
SET fight_category_id = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'main_card')
WHERE is_title_fight = 0
  AND (is_main_event = 1 OR is_co_main_event = 1)
  AND fight_category_id IS NULL;

-- Set remaining fights as Preliminary
UPDATE fact_fights
SET fight_category_id = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'preliminary')
WHERE fight_category_id IS NULL;

-- ============================================================
-- 4. ADD CARD POSITION FIELD (optional ordering within category)
-- ============================================================
ALTER TABLE fact_fights
ADD COLUMN IF NOT EXISTS card_position INT DEFAULT 0 AFTER fight_category_id;

-- Update card positions based on existing flags
UPDATE fact_fights
SET card_position = CASE
    WHEN is_main_event = 1 THEN 1
    WHEN is_co_main_event = 1 THEN 2
    ELSE 99
END;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Tables created: dim_fight_categories
-- Columns added:
--   - fact_fights.fight_category_id
--   - fact_fights.card_position
-- Data migration:
--   - All existing fights categorized based on title/main/co-main flags
-- ============================================================
