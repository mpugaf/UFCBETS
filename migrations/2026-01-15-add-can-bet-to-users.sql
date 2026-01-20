-- Migration: Add can_bet field to users table
-- Date: 2026-01-15
-- Description: Adds a boolean field to control if a user can place bets
--              When a user submits bets, this field is set to FALSE
--              Only admins can re-enable betting for users

USE ufc_analytics;

-- Add can_bet column
ALTER TABLE users
ADD COLUMN can_bet BOOLEAN DEFAULT TRUE
COMMENT 'Indica si el usuario puede realizar apuestas. Se desactiva al enviar apuestas y solo admins pueden reactivarlo';

-- Set all existing users to can_bet = TRUE
UPDATE users SET can_bet = TRUE WHERE can_bet IS NULL;
