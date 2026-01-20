-- =============================================
-- Migration: Create views for user points
-- Date: 2026-01-19
-- Description: Create database views for easy querying of user points
-- =============================================

-- View: Total points per user (all time)
CREATE OR REPLACE VIEW v_user_total_points AS
SELECT
  u.user_id,
  u.username,
  u.nickname,
  COALESCE(SUM(uph.points_earned), 0) AS total_points,
  COUNT(DISTINCT uph.bet_id) AS total_bets,
  COUNT(DISTINCT uph.event_id) AS events_participated
FROM users u
LEFT JOIN user_points_history uph ON u.user_id = uph.user_id
WHERE u.role = 'user'
GROUP BY u.user_id, u.username, u.nickname;

-- View: Points per user per event
CREATE OR REPLACE VIEW v_user_event_points AS
SELECT
  u.user_id,
  u.username,
  u.nickname,
  e.event_id,
  e.event_name,
  e.event_date,
  COALESCE(SUM(uph.points_earned), 0) AS event_points,
  COUNT(DISTINCT uph.bet_id) AS event_bets,
  COUNT(DISTINCT CASE WHEN uph.points_earned > 0 THEN uph.bet_id END) AS winning_bets
FROM users u
CROSS JOIN dim_events e
LEFT JOIN user_points_history uph ON u.user_id = uph.user_id AND e.event_id = uph.event_id
WHERE u.role = 'user'
GROUP BY u.user_id, u.username, u.nickname, e.event_id, e.event_name, e.event_date;

-- View: Points per user per year
CREATE OR REPLACE VIEW v_user_annual_points AS
SELECT
  u.user_id,
  u.username,
  u.nickname,
  YEAR(e.event_date) AS year,
  COALESCE(SUM(uph.points_earned), 0) AS annual_points,
  COUNT(DISTINCT uph.bet_id) AS annual_bets,
  COUNT(DISTINCT uph.event_id) AS events_participated
FROM users u
CROSS JOIN dim_events e
LEFT JOIN user_points_history uph ON u.user_id = uph.user_id AND uph.event_id = e.event_id
WHERE u.role = 'user'
GROUP BY u.user_id, u.username, u.nickname, YEAR(e.event_date);

-- View: Detailed user points breakdown
CREATE OR REPLACE VIEW v_user_points_detail AS
SELECT
  uph.point_id,
  uph.user_id,
  u.username,
  u.nickname,
  uph.bet_id,
  uph.fight_id,
  uph.event_id,
  e.event_name,
  e.event_date,
  fr.fighter_name AS red_fighter,
  fb.fighter_name AS blue_fighter,
  ub.predicted_winner_id,
  pw.fighter_name AS predicted_winner,
  ff.winner_id,
  w.fighter_name AS actual_winner,
  ub.bet_amount,
  ub.potential_return,
  uph.points_earned,
  uph.created_at
FROM user_points_history uph
JOIN users u ON uph.user_id = u.user_id
JOIN user_bets ub ON uph.bet_id = ub.bet_id
JOIN fact_fights ff ON uph.fight_id = ff.fight_id
JOIN dim_events e ON uph.event_id = e.event_id
JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
LEFT JOIN dim_fighters pw ON ub.predicted_winner_id = pw.fighter_id
LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id;
