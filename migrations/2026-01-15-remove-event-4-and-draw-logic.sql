-- Migration: Remove UFC 323 Test Event and Draw Betting Logic
-- Date: 2026-01-15
-- Description:
--   1. Removes the test event (event_id=4) and all related data
--   2. Draw odds logic remains in database but is no longer used in frontend
--   3. All events now use the same 2-fighter selection interface

USE ufc_analytics;

-- Delete user bets related to event 4 fights
DELETE FROM user_bets WHERE fight_id IN (SELECT fight_id FROM fact_fights WHERE event_id = 4);

-- Delete betting odds for event 4 fights
DELETE FROM betting_odds WHERE fight_id IN (SELECT fight_id FROM fact_fights WHERE event_id = 4);

-- Delete fights from event 4
DELETE FROM fact_fights WHERE event_id = 4;

-- Delete the event itself
DELETE FROM dim_events WHERE event_id = 4;

-- Verify remaining events
SELECT event_id, event_name, event_date FROM dim_events ORDER BY event_date DESC;
