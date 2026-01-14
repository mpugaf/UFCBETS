-- UFC Data Warehouse - Modelo Dimensional
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS ufc_analytics;
USE ufc_analytics;

-- ============================================
-- DIMENSIONES DE CATÁLOGO
-- ============================================

CREATE TABLE dim_countries (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(100) NOT NULL UNIQUE,
    country_code VARCHAR(3) NOT NULL UNIQUE,
    INDEX idx_country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_stances (
    stance_id INT AUTO_INCREMENT PRIMARY KEY,
    stance_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_genders (
    gender_id INT AUTO_INCREMENT PRIMARY KEY,
    gender_name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_event_types (
    event_type_id INT AUTO_INCREMENT PRIMARY KEY,
    event_type_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_bonus_types (
    bonus_type_id INT AUTO_INCREMENT PRIMARY KEY,
    bonus_type_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_fight_results (
    fight_result_id INT AUTO_INCREMENT PRIMARY KEY,
    result_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_fight_methods (
    method_id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL UNIQUE,
    method_category VARCHAR(50),
    description VARCHAR(255),
    INDEX idx_method_category (method_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DIMENSIONES PRINCIPALES
-- ============================================

CREATE TABLE dim_fighters (
    fighter_id INT AUTO_INCREMENT PRIMARY KEY,
    fighter_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    country_id INT,
    date_of_birth DATE,
    height_cm DECIMAL(5,2),
    reach_cm DECIMAL(5,2),
    stance_id INT,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    total_nc INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES dim_countries(country_id) ON DELETE SET NULL,
    FOREIGN KEY (stance_id) REFERENCES dim_stances(stance_id) ON DELETE SET NULL,
    INDEX idx_fighter_name (fighter_name),
    INDEX idx_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_weight_classes (
    weight_class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    gender_id INT NOT NULL,
    weight_limit_lbs DECIMAL(5,2) NOT NULL,
    weight_limit_kg DECIMAL(5,2) NOT NULL,
    display_order INT,
    FOREIGN KEY (gender_id) REFERENCES dim_genders(gender_id) ON DELETE CASCADE,
    UNIQUE KEY unique_class_gender (class_name, gender_id),
    INDEX idx_class_name (class_name),
    INDEX idx_gender (gender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(200) NOT NULL,
    event_date DATE NOT NULL,
    event_type_id INT NOT NULL,
    venue VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    country_id INT,
    attendance INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES dim_event_types(event_type_id) ON DELETE CASCADE,
    FOREIGN KEY (country_id) REFERENCES dim_countries(country_id) ON DELETE SET NULL,
    INDEX idx_event_date (event_date),
    INDEX idx_event_name (event_name),
    INDEX idx_event_type (event_type_id),
    INDEX idx_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_referees (
    referee_id INT AUTO_INCREMENT PRIMARY KEY,
    referee_name VARCHAR(100) NOT NULL,
    country_id INT,
    total_fights_refereed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES dim_countries(country_id) ON DELETE SET NULL,
    INDEX idx_referee_name (referee_name),
    INDEX idx_country (country_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_bonuses (
    bonus_id INT AUTO_INCREMENT PRIMARY KEY,
    bonus_type_id INT NOT NULL,
    bonus_amount DECIMAL(10,2),
    event_id INT,
    notes VARCHAR(255),
    FOREIGN KEY (bonus_type_id) REFERENCES dim_bonus_types(bonus_type_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES dim_events(event_id) ON DELETE SET NULL,
    INDEX idx_bonus_type (bonus_type_id),
    INDEX idx_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_time (
    time_id INT AUTO_INCREMENT PRIMARY KEY,
    full_date DATE NOT NULL UNIQUE,
    day_of_week VARCHAR(10),
    day_of_month INT,
    month INT,
    month_name VARCHAR(10),
    quarter INT,
    year INT,
    is_weekend BOOLEAN,
    INDEX idx_full_date (full_date),
    INDEX idx_year_month (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_rankings (
    ranking_id INT AUTO_INCREMENT PRIMARY KEY,
    fighter_id INT NOT NULL,
    weight_class_id INT NOT NULL,
    rank_position INT,
    is_champion BOOLEAN DEFAULT FALSE,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fighter_id) REFERENCES dim_fighters(fighter_id) ON DELETE CASCADE,
    FOREIGN KEY (weight_class_id) REFERENCES dim_weight_classes(weight_class_id) ON DELETE CASCADE,
    INDEX idx_fighter_ranking (fighter_id, effective_date),
    INDEX idx_weight_class_ranking (weight_class_id, rank_position, effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA DE HECHOS
-- ============================================

CREATE TABLE fact_fights (
    fight_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    time_id INT NOT NULL,
    weight_class_id INT NOT NULL,
    referee_id INT,

    -- Peleadores
    fighter_red_id INT NOT NULL,
    fighter_blue_id INT NOT NULL,

    -- Resultado
    winner_id INT,
    fight_result_id INT NOT NULL,
    method_id INT NOT NULL,
    method_detail VARCHAR(100),

    -- Información de tiempo
    scheduled_rounds INT NOT NULL,
    final_round INT NOT NULL,
    final_time_seconds INT NOT NULL,
    total_fight_time_seconds INT NOT NULL,

    -- Estadísticas Fighter Red
    red_significant_strikes_landed INT DEFAULT 0,
    red_significant_strikes_attempted INT DEFAULT 0,
    red_total_strikes_landed INT DEFAULT 0,
    red_total_strikes_attempted INT DEFAULT 0,
    red_takedowns_landed INT DEFAULT 0,
    red_takedowns_attempted INT DEFAULT 0,
    red_submission_attempts INT DEFAULT 0,
    red_knockdowns INT DEFAULT 0,
    red_control_time_seconds INT DEFAULT 0,

    -- Estadísticas Fighter Blue
    blue_significant_strikes_landed INT DEFAULT 0,
    blue_significant_strikes_attempted INT DEFAULT 0,
    blue_total_strikes_landed INT DEFAULT 0,
    blue_total_strikes_attempted INT DEFAULT 0,
    blue_takedowns_landed INT DEFAULT 0,
    blue_takedowns_attempted INT DEFAULT 0,
    blue_submission_attempts INT DEFAULT 0,
    blue_knockdowns INT DEFAULT 0,
    blue_control_time_seconds INT DEFAULT 0,

    -- Características especiales
    is_title_fight BOOLEAN DEFAULT FALSE,
    is_main_event BOOLEAN DEFAULT FALSE,
    is_co_main_event BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (event_id) REFERENCES dim_events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (time_id) REFERENCES dim_time(time_id) ON DELETE CASCADE,
    FOREIGN KEY (weight_class_id) REFERENCES dim_weight_classes(weight_class_id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES dim_referees(referee_id) ON DELETE SET NULL,
    FOREIGN KEY (fighter_red_id) REFERENCES dim_fighters(fighter_id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_blue_id) REFERENCES dim_fighters(fighter_id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES dim_fighters(fighter_id) ON DELETE SET NULL,
    FOREIGN KEY (fight_result_id) REFERENCES dim_fight_results(fight_result_id) ON DELETE CASCADE,
    FOREIGN KEY (method_id) REFERENCES dim_fight_methods(method_id) ON DELETE CASCADE,

    INDEX idx_event_fights (event_id),
    INDEX idx_fighter_red_fights (fighter_red_id),
    INDEX idx_fighter_blue_fights (fighter_blue_id),
    INDEX idx_weight_class_fights (weight_class_id),
    INDEX idx_fight_date (time_id),
    INDEX idx_title_fights (is_title_fight),
    INDEX idx_method (method_id),
    INDEX idx_fight_result (fight_result_id),
    INDEX idx_winner (winner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA PUENTE (Bridge Table)
-- ============================================

CREATE TABLE bridge_fight_bonuses (
    fight_bonus_id INT AUTO_INCREMENT PRIMARY KEY,
    fight_id INT NOT NULL,
    fighter_id INT NOT NULL,
    bonus_id INT NOT NULL,
    awarded_date DATE NOT NULL,
    FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id) ON DELETE CASCADE,
    FOREIGN KEY (fighter_id) REFERENCES dim_fighters(fighter_id) ON DELETE CASCADE,
    FOREIGN KEY (bonus_id) REFERENCES dim_bonuses(bonus_id) ON DELETE CASCADE,
    UNIQUE KEY unique_fight_fighter_bonus (fight_id, fighter_id, bonus_id),
    INDEX idx_fight_bonuses (fight_id),
    INDEX idx_fighter_bonuses (fighter_id),
    INDEX idx_bonus_type (bonus_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

CREATE VIEW vw_fighter_stats AS
SELECT
    f.fighter_id,
    f.fighter_name,
    c.country_name,
    c.country_code,
    COUNT(DISTINCT ff.fight_id) as total_ufc_fights,
    SUM(CASE WHEN ff.winner_id = f.fighter_id THEN 1 ELSE 0 END) as ufc_wins,
    SUM(CASE WHEN ff.winner_id != f.fighter_id AND fr.result_name = 'Win' THEN 1 ELSE 0 END) as ufc_losses,
    SUM(CASE WHEN fr.result_name = 'Draw' THEN 1 ELSE 0 END) as ufc_draws,
    SUM(CASE WHEN ff.is_title_fight = TRUE THEN 1 ELSE 0 END) as title_fights,
    COUNT(DISTINCT bfb.bonus_id) as total_bonuses
FROM dim_fighters f
LEFT JOIN dim_countries c ON f.country_id = c.country_id
LEFT JOIN fact_fights ff ON f.fighter_id = ff.fighter_red_id OR f.fighter_id = ff.fighter_blue_id
LEFT JOIN dim_fight_results fr ON ff.fight_result_id = fr.fight_result_id
LEFT JOIN bridge_fight_bonuses bfb ON f.fighter_id = bfb.fighter_id
GROUP BY f.fighter_id, f.fighter_name, c.country_name, c.country_code;

CREATE VIEW vw_fights_detailed AS
SELECT
    ff.fight_id,
    e.event_name,
    e.event_date,
    et.event_type_name,
    wc.class_name as weight_class,
    g.gender_name as gender,
    fr.fighter_name as red_corner,
    fb.fighter_name as blue_corner,
    w.fighter_name as winner,
    fm.method_name,
    fres.result_name as fight_result,
    ff.final_round,
    ff.final_time_seconds,
    ff.is_title_fight,
    ff.is_main_event,
    ref.referee_name
FROM fact_fights ff
JOIN dim_events e ON ff.event_id = e.event_id
JOIN dim_event_types et ON e.event_type_id = et.event_type_id
JOIN dim_weight_classes wc ON ff.weight_class_id = wc.weight_class_id
JOIN dim_genders g ON wc.gender_id = g.gender_id
JOIN dim_fighters fr ON ff.fighter_red_id = fr.fighter_id
JOIN dim_fighters fb ON ff.fighter_blue_id = fb.fighter_id
JOIN dim_fight_methods fm ON ff.method_id = fm.method_id
JOIN dim_fight_results fres ON ff.fight_result_id = fres.fight_result_id
LEFT JOIN dim_fighters w ON ff.winner_id = w.fighter_id
LEFT JOIN dim_referees ref ON ff.referee_id = ref.referee_id;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    country_id INT,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES dim_countries(country_id)
);

-- Cuotas de apuesta (odds)
CREATE TABLE betting_odds (
    odds_id INT AUTO_INCREMENT PRIMARY KEY,
    fight_id INT NOT NULL,
    fighter_id INT NOT NULL,
    decimal_odds DECIMAL(5,2), -- ej: 1.85
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id),
    FOREIGN KEY (fighter_id) REFERENCES dim_fighters(fighter_id)
);

-- Pronósticos
CREATE TABLE predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fight_id INT NOT NULL,
    predicted_winner_id INT NOT NULL,
    predicted_method_id INT,
    predicted_round INT,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id),
    UNIQUE KEY unique_user_fight (user_id, fight_id)
);