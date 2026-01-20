-- ============================================================
-- UFC 323 Test Data - Updated with Categories
-- Event without winners for testing betting system
-- ============================================================

USE ufc_analytics;

-- First, ensure categories exist
INSERT INTO dim_fight_categories (category_name, category_code, display_order, description) VALUES
('Preliminares', 'preliminary', 1, 'Peleas preliminares del evento'),
('Cartelera Estelar', 'main_card', 2, 'Peleas de la cartelera principal'),
('Pelea por el Título', 'title_fight', 3, 'Peleas por el campeonato')
ON DUPLICATE KEY UPDATE category_name=category_name;

-- Get category IDs
SET @cat_preliminary = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'preliminary');
SET @cat_main_card = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'main_card');
SET @cat_title = (SELECT category_id FROM dim_fight_categories WHERE category_code = 'title_fight');

-- Delete UFC 323 if it exists (for clean re-insert)
DELETE FROM dim_events WHERE event_name = 'UFC 323: Test Event';

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
SET @bantamweight_id = (SELECT weight_class_id FROM dim_weight_classes WHERE class_name = 'Bantamweight' LIMIT 1);

-- Get default IDs for required fields
SET @default_time_id = (SELECT time_id FROM dim_time WHERE full_date = '2026-02-15' LIMIT 1);
-- Insert time if not exists (ignore if exists)
INSERT IGNORE INTO dim_time (full_date, day_of_week, day_of_month, month, month_name, quarter, year, is_weekend)
VALUES ('2026-02-15', 'Sunday', 15, 2, 'February', 1, 2026, TRUE);
SET @default_time_id = (SELECT time_id FROM dim_time WHERE full_date = '2026-02-15' LIMIT 1);

SET @default_result_id = (SELECT fight_result_id FROM dim_fight_results WHERE result_name = 'Win' LIMIT 1);
SET @default_method_id = (SELECT method_id FROM dim_fight_methods WHERE method_name = 'Decision - Unanimous' LIMIT 1);
SET @default_referee_id = (SELECT referee_id FROM dim_referees LIMIT 1);

-- Get fighter IDs (we'll use existing fighters from the database)
SET @fighter1 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 0);
SET @fighter2 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 1);
SET @fighter3 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 2);
SET @fighter4 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 3);
SET @fighter5 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 4);
SET @fighter6 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 5);
SET @fighter7 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 6);
SET @fighter8 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 7);
SET @fighter9 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 8);
SET @fighter10 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 9);
SET @fighter11 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 10);
SET @fighter12 = (SELECT fighter_id FROM dim_fighters ORDER BY fighter_id LIMIT 1 OFFSET 11);

-- ============================================================
-- INSERT FIGHTS WITH CATEGORIES
-- ============================================================

-- Fight 1: MAIN EVENT - TITLE FIGHT
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @cat_title,
  1, -- Position 1 (main event)
  @default_referee_id,
  @fighter1,
  @fighter2,
  NULL, -- No winner yet
  @default_result_id,
  @default_method_id,
  5, -- Title fight: 5 rounds
  0, 0, 0,
  1, -- Title fight
  1, -- Main event
  0
);
SET @fight1_id = LAST_INSERT_ID();

-- Fight 2: CO-MAIN EVENT - MAIN CARD
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @welterweight_id,
  @cat_main_card,
  2, -- Position 2 (co-main)
  @default_referee_id,
  @fighter3,
  @fighter4,
  NULL,
  @default_result_id,
  @default_method_id,
  3, 0, 0, 0,
  0, 0,
  1 -- Co-main event
);
SET @fight2_id = LAST_INSERT_ID();

-- Fight 3: MAIN CARD Fight
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @middleweight_id,
  @cat_main_card,
  3, -- Position 3
  @default_referee_id,
  @fighter5,
  @fighter6,
  NULL,
  @default_result_id,
  @default_method_id,
  3, 0, 0, 0,
  0, 0, 0
);
SET @fight3_id = LAST_INSERT_ID();

-- Fight 4: MAIN CARD Fight
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @featherweight_id,
  @cat_main_card,
  4, -- Position 4
  @default_referee_id,
  @fighter7,
  @fighter8,
  NULL,
  @default_result_id,
  @default_method_id,
  3, 0, 0, 0,
  0, 0, 0
);
SET @fight4_id = LAST_INSERT_ID();

-- Fight 5: PRELIMINARY Fight
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @heavyweight_id,
  @cat_preliminary,
  5, -- Position 5
  @default_referee_id,
  @fighter9,
  @fighter10,
  NULL,
  @default_result_id,
  @default_method_id,
  3, 0, 0, 0,
  0, 0, 0
);
SET @fight5_id = LAST_INSERT_ID();

-- Fight 6: PRELIMINARY Fight
INSERT INTO fact_fights (
  event_id,
  time_id,
  weight_class_id,
  fight_category_id,
  card_position,
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
  @bantamweight_id,
  @cat_preliminary,
  6, -- Position 6
  @default_referee_id,
  @fighter11,
  @fighter12,
  NULL,
  @default_result_id,
  @default_method_id,
  3, 0, 0, 0,
  0, 0, 0
);
SET @fight6_id = LAST_INSERT_ID();

-- ============================================================
-- INSERT BETTING ODDS (with DRAW ODDS at 10.00)
-- ============================================================

-- Fight 1 Odds (Title Fight - Close match)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight1_id, @fighter1, 1.85, 'fighter'),
(@fight1_id, @fighter2, 2.10, 'fighter'),
(@fight1_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- Fight 2 Odds (Co-Main - Competitive)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight2_id, @fighter3, 1.65, 'fighter'),
(@fight2_id, @fighter4, 2.35, 'fighter'),
(@fight2_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- Fight 3 Odds (Underdog story)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight3_id, @fighter5, 1.45, 'fighter'),
(@fight3_id, @fighter6, 3.00, 'fighter'),
(@fight3_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- Fight 4 Odds (Even match)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight4_id, @fighter7, 1.95, 'fighter'),
(@fight4_id, @fighter8, 1.95, 'fighter'),
(@fight4_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- Fight 5 Odds (Favorite heavy)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight5_id, @fighter9, 1.35, 'fighter'),
(@fight5_id, @fighter10, 3.50, 'fighter'),
(@fight5_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- Fight 6 Odds (Balanced)
INSERT INTO betting_odds (fight_id, fighter_id, decimal_odds, outcome_type) VALUES
(@fight6_id, @fighter11, 1.75, 'fighter'),
(@fight6_id, @fighter12, 2.20, 'fighter'),
(@fight6_id, NULL, 10.00, 'draw'); -- Draw odds at 10.00

-- ============================================================
-- Set this event as current for betting
-- ============================================================
UPDATE app_config SET config_value = @event_id WHERE config_key = 'current_event_id';
UPDATE app_config SET config_value = 'true' WHERE config_key = 'betting_enabled';

-- ============================================================
-- Display results
-- ============================================================
SELECT CONCAT('✅ Event Created: UFC 323 (ID: ', @event_id, ')') as Status;

SELECT
  CONCAT(
    CASE
      WHEN fc.category_code = 'title_fight' THEN '🏆 '
      WHEN fc.category_code = 'main_card' THEN '⭐ '
      WHEN fc.category_code = 'preliminary' THEN '🥊 '
      ELSE ''
    END,
    fc.category_name
  ) as Category,
  CONCAT(fr.fighter_name, ' vs ', fb.fighter_name) as Fight,
  wc.class_name as Weight_Class,
  CONCAT(
    (SELECT decimal_odds FROM betting_odds WHERE fight_id = f.fight_id AND fighter_id = f.fighter_red_id LIMIT 1),
    ' / ',
    (SELECT decimal_odds FROM betting_odds WHERE fight_id = f.fight_id AND fighter_id = f.fighter_blue_id LIMIT 1),
    ' / ',
    (SELECT decimal_odds FROM betting_odds WHERE fight_id = f.fight_id AND outcome_type = 'draw' LIMIT 1),
    ' (draw)'
  ) as Odds
FROM fact_fights f
JOIN dim_fighters fr ON f.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON f.fighter_blue_id = fb.fighter_id
LEFT JOIN dim_weight_classes wc ON f.weight_class_id = wc.weight_class_id
LEFT JOIN dim_fight_categories fc ON f.fight_category_id = fc.category_id
WHERE f.event_id = @event_id
ORDER BY fc.display_order DESC, f.card_position ASC;

SELECT '✅ UFC 323 loaded successfully with 6 fights (1 title, 3 main card, 2 preliminary)' as Summary;
