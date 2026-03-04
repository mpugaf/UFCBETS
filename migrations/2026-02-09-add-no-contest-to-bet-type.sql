-- Migration: Add 'no_contest' to bet_type enum
-- Date: 2026-02-09
-- Description: Adds 'no_contest' as a valid bet type in user_bets table
--              This allows users to bet on fights ending in no contest

USE ufc_analytics;

-- Modify bet_type enum to include 'no_contest'
ALTER TABLE user_bets
MODIFY COLUMN bet_type ENUM('fighter_win', 'draw', 'no_contest') DEFAULT 'fighter_win';

-- Verify the change
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ufc_analytics'
  AND TABLE_NAME = 'user_bets'
  AND COLUMN_NAME = 'bet_type';
