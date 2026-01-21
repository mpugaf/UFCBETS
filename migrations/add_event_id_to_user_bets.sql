-- Migration: Add event_id to user_bets table
-- Date: 2026-01-21
-- Description: Add event_id column to user_bets for better performance and easier filtering

-- Step 1: Add event_id column
ALTER TABLE user_bets
ADD COLUMN event_id INT(11) AFTER fight_id;

-- Step 2: Fill event_id from fact_fights
UPDATE user_bets ub
INNER JOIN fact_fights ff ON ub.fight_id = ff.fight_id
SET ub.event_id = ff.event_id;

-- Step 3: Add foreign key constraint
ALTER TABLE user_bets
ADD CONSTRAINT fk_user_bets_event
FOREIGN KEY (event_id) REFERENCES dim_events(event_id);

-- Step 4: Add index for better query performance
CREATE INDEX idx_user_bets_event_id ON user_bets(event_id);

-- Verify the migration
SELECT 'Migration completed. Checking data...' as status;
SELECT
    COUNT(*) as total_bets,
    COUNT(DISTINCT event_id) as events_with_bets,
    COUNT(CASE WHEN event_id IS NULL THEN 1 END) as null_event_ids
FROM user_bets;
