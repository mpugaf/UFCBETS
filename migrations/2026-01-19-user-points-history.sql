-- =============================================
-- Migration: Create user_points_history table
-- Date: 2026-01-19
-- Description:
--   - Creates new table to track points earned per bet
--   - Removes total_points field from users table
--   - Allows accurate point calculation by event and year
-- =============================================

-- Create user_points_history table
CREATE TABLE IF NOT EXISTS user_points_history (
  point_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bet_id INT NOT NULL,
  fight_id INT NOT NULL,
  event_id INT NOT NULL,
  points_earned DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_points_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_points_bet FOREIGN KEY (bet_id) REFERENCES user_bets(bet_id) ON DELETE CASCADE,
  CONSTRAINT fk_points_fight FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id) ON DELETE CASCADE,
  CONSTRAINT fk_points_event FOREIGN KEY (event_id) REFERENCES dim_events(event_id) ON DELETE CASCADE,

  -- Indexes for performance
  INDEX idx_user_points (user_id),
  INDEX idx_event_points (event_id),
  INDEX idx_bet_points (bet_id),
  INDEX idx_created_at (created_at),

  -- Ensure one point record per bet (prevent duplicates)
  UNIQUE KEY unique_bet_points (bet_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Remove total_points column from users table
ALTER TABLE users DROP COLUMN IF EXISTS total_points;

-- Add comment to table
ALTER TABLE user_points_history COMMENT = 'Tracks points earned by users for each bet, enabling accurate event and annual summaries';
