-- ============================================================
-- UFC 323 Test Data
-- Event without winners for testing betting system
-- ============================================================

USE ufc_analytics;

-- Insert UFC 323 Event
INSERT INTO dim_events (event_name, event_date, event_type_id, venue, city, state, country_id)
VALUES (
  'UFC 323: Test Event',
  '2026-02-15',
  1, -- UFC numbered event
  'T-Mobile Arena',
  'Las Vegas',
  'Nevada',
  (SELECT country_id FROM dim_countries WHERE country_code = 'USA' LIMIT 1)
);

SET @event_id = LAST_INSERT_ID();

-- Get weight class IDs
SET @lightweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Lightweight' LIMIT 1);
SET @welterweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Welterweight' LIMIT 1);
SET @middleweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Middleweight' LIMIT 1);
SET @heavyweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Heavyweight' LIMIT 1);
SET @featherweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Featherweight' LIMIT 1);

-- Get default IDs for required fields
SET @default_time_id = (SELECT time_id FROM dim_time LIMIT 1);
SET @default_result_id = (SELECT result_id FROM dim_fight_results LIMIT 1);
SET @default_method_id = (SELECT method_id FROM dim_fight_methods LIMIT 1);
SET @default_referee_id = (SELECT referee_id FROM dim_referees LIMIT 1);

-- Get some fighter IDs (assuming they exist in the database)
-- We'll use existing fighters from the database
SET @fighter1 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 0);
SET @fighter2 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 1);
SET @fighter3 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 2);
SET @fighter4 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 3);
SET @fighter5 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 4);
SET @fighter6 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 5);
SET @fighter7 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 6);
SET @fighter8 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 7);
SET @fighter9 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 8);
SET @fighter10 = (SELECT fighter_id FROM dim_fighters ORDER BY RAND() LIMIT 1 OFFSET 9);

-- Insert Main Event (Title Fight)
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  referee_id,
  fighter_red_id,
  fighter_blue_id,
  winner_id,
  fight_result_id,
  method_id,
  scheduled_rounds,
  final_round,
  final_time_seconds,
  total_fight_time_seconds,
  is_title_fight,
  is_main_event,
  is_co_main_event
) VALUES (
  @event_id,
  @default_time_id,
  @lightweight_id,
  @default_referee_id,
  @fighter1,
  @fighter2,
  NULL, -- No winner yet
  @default_result_id,
  @default_method_id,
  5, -- Title fight: 5 rounds
  0,
  0,
  0,
  1, -- Title fight
  1, -- Main event
  0
);

SET @fight1_id = LAST_INSERT_ID();

-- Insert Co-Main Event
INSERT INTO fact_fights (
  event_id,
  fighter_red_id,
  fighter_blue_id,
  weight_class_id,
  is_title_fight,
  is_main_event,
  is_co_main_event,
  winner_id,
  fight_date
) VALUES (
  @event_id,
  @fighter3,
  @fighter4,
  @welterweight_id,
  0,
  0,
  1, -- Co-main event
  NULL,
  '2026-02-15'
);

SET @fight2_id = LAST_INSERT_ID();

-- Insert Fight 3
INSERT INTO fact_fights (
  event_id,
  fighter_red_id,
  fighter_blue_id,
  weight_class_id,
  is_title_fight,
  is_main_event,
  is_co_main_event,
  winner_id,
  fight_date
) VALUES (
  @event_id,
  @fighter5,
  @fighter6,
  @middleweight_id,
  0, 0, 0,
  NULL,
  '2026-02-15'
);

SET @fight3_id = LAST_INSERT_ID();

-- Insert Fight 4
INSERT INTO fact_fights (
  event_id,
  fighter_red_id,
  fighter_blue_id,
  weight_class_id,
  is_title_fight,
  is_main_event,
  is_co_main_event,
  winner_id,
  fight_date
) VALUES (
  @event_id,
  @fighter7,
  @fighter8,
  @featherweight_id,
  0, 0, 0,
  NULL,
  '2026-02-15'
);

SET @fight4_id = LAST_INSERT_ID();

-- Insert Fight 5
INSERT INTO fact_fights (
  event_id,
  fighter_red_id,
  fighter_blue_id,
  weight_class_id,
  is_title_fight,
  is_main_event,
  is_co_main_event,
  winner_id,
  fight_date
) VALUES (
  @event_id,
  @fighter9,
  @fighter10,
  @heavyweight_id,
  0, 0, 0,
  NULL,
  '2026-02-15'
);

SET @fight5_id = LAST_INSERT_ID();

-- ============================================================
-- INSERT BETTING ODDS
-- ============================================================

-- Fight 1 Odds (Main Event - Close fight)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight1_id, @fighter1, 1.85, 'fighter'),
(@fight1_id, @fighter2, 2.10, 'fighter'),
(@fight1_id, NULL, 25.00, 'draw'); -- Very unlikely draw

-- Fight 2 Odds (Co-Main - Competitive)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight2_id, @fighter3, 1.65, 'fighter'),
(@fight2_id, @fighter4, 2.35, 'fighter'),
(@fight2_id, NULL, 30.00, 'draw');

-- Fight 3 Odds (Underdog story)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight3_id, @fighter5, 1.45, 'fighter'),
(@fight3_id, @fighter6, 3.00, 'fighter'),
(@fight3_id, NULL, 35.00, 'draw');

-- Fight 4 Odds (Even match)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight4_id, @fighter7, 1.95, 'fighter'),
(@fight4_id, @fighter8, 1.95, 'fighter'),
(@fight4_id, NULL, 28.00, 'draw');

-- Fight 5 Odds (Favorite heavy)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight5_id, @fighter9, 1.35, 'fighter'),
(@fight5_id, @fighter10, 3.50, 'fighter'),
(@fight5_id, NULL, 40.00, 'draw');

-- ============================================================
-- Set this event as current for betting
-- ============================================================
INSERT INTO app_config (config_key, config_value)
VALUES ('current_event_id', @event_id)
ON DUPLICATE KEY UPDATE config_value = @event_id;

-- Enable betting
INSERT INTO app_config (config_key, config_value)
VALUES ('betting_enabled', 'true')
ON DUPLICATE KEY UPDATE config_value = 'true';

-- ============================================================
-- Display results
-- ============================================================
SELECT
  CONCAT('Event Created: UFC 323 (ID: ', @event_id, ')') as Status;

SELECT
  f.fight_id,
  CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as Fight,
  wc.class_name as Weight_Class,
  CASE
    WHEN f.is_main_event = 1 THEN 'MAIN EVENT'
    WHEN f.is_co_main_event = 1 THEN 'CO-MAIN EVENT'
    ELSE 'PRELIM'
  END as Card_Position,
  CONCAT(
    (SELECT decimal_odds FROM betting_odds WHERE fight_id = f.fight_id AND fighter_id = f.fighter_red_id LIMIT 1),
    ' / ',
    (SELECT decimal_odds FROM betting_odds WHERE fight_id = f.fight_id AND fighter_id = f.fighter_blue_id LIMIT 1)
  ) as Odds
FROM fact_fights f
JOIN dim_fighters fr ON f.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON f.fighter_blue_id = fb.fighter_id
LEFT JOIN dim_weight_classes wc ON f.weight_class_id = wc.weight_class_id
WHERE f.event_id = @event_id
ORDER BY f.is_main_event DESC, f.is_co_main_event DESC, f.fight_id;
