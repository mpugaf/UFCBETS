-- ============================================================
-- Migration: Registration Tokens and System Enhancements
-- Date: 2026-01-14
-- Description: Adds registration tokens, nickname field,
--              fighter images, and draw betting support
-- ============================================================

USE ufc_analytics;

-- ============================================================
-- 1. CREATE REGISTRATION TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS registration_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    created_by INT NOT NULL,
    used_by INT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_token (token),
    INDEX idx_is_used (is_used),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ADD NICKNAME TO USERS TABLE
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS nickname VARCHAR(50) NULL AFTER username,
ADD INDEX IF NOT EXISTS idx_nickname (nickname);

-- ============================================================
-- 3. ADD IMAGE PATH TO FIGHTERS TABLE
-- ============================================================
ALTER TABLE dim_fighters
ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL AFTER nickname;

-- ============================================================
-- 4. ENHANCE BETTING SYSTEM FOR DRAW SUPPORT
-- ============================================================

-- Add bet_type column to user_bets (fighter_win or draw)
ALTER TABLE user_bets
ADD COLUMN IF NOT EXISTS bet_type ENUM('fighter_win', 'draw') DEFAULT 'fighter_win' AFTER predicted_winner_id;

-- Make predicted_winner_id nullable (for draw bets)
ALTER TABLE user_bets
MODIFY COLUMN predicted_winner_id INT NULL;

-- Migrate existing data to have bet_type set
UPDATE user_bets
SET bet_type = 'fighter_win'
WHERE bet_type IS NULL;

-- Add outcome_type to betting_odds (fighter or draw)
ALTER TABLE betting_odds
ADD COLUMN IF NOT EXISTS outcome_type ENUM('fighter', 'draw') DEFAULT 'fighter' AFTER fighter_id;

-- Make fighter_id nullable (for draw odds)
ALTER TABLE betting_odds
MODIFY COLUMN fighter_id INT NULL;

-- Add index for outcome_type
ALTER TABLE betting_odds
ADD INDEX IF NOT EXISTS idx_outcome_type (outcome_type);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Tables created: registration_tokens
-- Columns added:
--   - users.nickname
--   - dim_fighters.image_path
--   - user_bets.bet_type
--   - betting_odds.outcome_type
-- Columns modified:
--   - user_bets.predicted_winner_id (now nullable)
--   - betting_odds.fighter_id (now nullable)
-- ============================================================
