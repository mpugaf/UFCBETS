-- UFC Data Warehouse - Datos Iniciales
-- Script para poblar las dimensiones de catálogo con valores iniciales
-- Usa INSERT IGNORE para evitar duplicados en caso de ejecuciones múltiples

USE ufc_analytics;

-- ============================================
-- DIMENSIONES DE CATÁLOGO
-- ============================================

-- Países (principales países con peleadores de UFC)
INSERT IGNORE INTO dim_countries (country_name, country_code) VALUES
('United States', 'USA'),
('Brazil', 'BRA'),
('Russia', 'RUS'),
('Mexico', 'MEX'),
('Canada', 'CAN'),
('United Kingdom', 'GBR'),
('Ireland', 'IRL'),
('Australia', 'AUS'),
('Poland', 'POL'),
('Netherlands', 'NLD'),
('Sweden', 'SWE'),
('France', 'FRA'),
('Germany', 'DEU'),
('China', 'CHN'),
('Japan', 'JPN'),
('South Korea', 'KOR'),
('New Zealand', 'NZL'),
('Chile', 'CHL'),
('Argentina', 'ARG'),
('Venezuela', 'VEN'),
('Cuba', 'CUB'),
('Spain', 'ESP'),
('Italy', 'ITA'),
('Portugal', 'PRT'),
('Israel', 'ISR'),
('Nigeria', 'NGA'),
('Cameroon', 'CMR'),
('Kazakhstan', 'KAZ'),
('Thailand', 'THA'),
('Philippines', 'PHL');

-- Posturas de combate
INSERT IGNORE INTO dim_stances (stance_name) VALUES
('Orthodox'),
('Southpaw'),
('Switch');

-- Géneros
INSERT IGNORE INTO dim_genders (gender_name) VALUES
('Male'),
('Female');

-- Tipos de eventos
INSERT IGNORE INTO dim_event_types (event_type_name, description) VALUES
('PPV', 'Pay-Per-View numbered events'),
('Fight Night', 'UFC Fight Night events'),
('TUF Finale', 'The Ultimate Fighter season finales'),
('Special', 'Special events and international cards');

-- Tipos de bonos
INSERT IGNORE INTO dim_bonus_types (bonus_type_name, description) VALUES
('Performance of the Night', 'Outstanding individual performance bonus'),
('Fight of the Night', 'Most exciting fight bonus (shared by both fighters)'),
('Knockout of the Night', 'Best knockout bonus (legacy bonus type)'),
('Submission of the Night', 'Best submission bonus (legacy bonus type)');

-- Resultados de pelea
INSERT IGNORE INTO dim_fight_results (result_name, description) VALUES
('Win', 'Fighter won the bout'),
('Loss', 'Fighter lost the bout'),
('Draw', 'Fight ended in a draw'),
('No Contest', 'Fight ruled no contest'),
('DQ', 'Fighter disqualified');

-- Métodos de finalización
INSERT IGNORE INTO dim_fight_methods (method_name, method_category, description) VALUES
('KO/TKO', 'Knockout', 'Knockout or Technical Knockout'),
('Submission', 'Submission', 'Opponent tapped out or was rendered unconscious'),
('Decision - Unanimous', 'Decision', 'All judges scored for the same fighter'),
('Decision - Split', 'Decision', 'Judges split on the winner'),
('Decision - Majority', 'Decision', 'Two judges scored for the same fighter, one scored a draw'),
('DQ', 'Disqualification', 'Fighter disqualified for rule violations'),
('No Contest', 'No Contest', 'Fight ruled no contest due to accidental foul or other circumstances'),
('Draw - Unanimous', 'Draw', 'All judges scored the fight a draw'),
('Draw - Majority', 'Draw', 'Two judges scored a draw, one scored for a fighter'),
('Draw - Split', 'Draw', 'Each judge scored differently');

-- ============================================
-- CATEGORÍAS DE PESO
-- ============================================

-- Insertar categorías de peso solo si no existen
-- Verifica usando la combinación única de class_name y gender_id

-- Categorías masculinas
INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Flyweight', gender_id, 125, 56.7, 1
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Flyweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Bantamweight', gender_id, 135, 61.2, 2
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Bantamweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Featherweight', gender_id, 145, 65.8, 3
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Featherweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Lightweight', gender_id, 155, 70.3, 4
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Lightweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Welterweight', gender_id, 170, 77.1, 5
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Welterweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Middleweight', gender_id, 185, 83.9, 6
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Middleweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Light Heavyweight', gender_id, 205, 93.0, 7
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Light Heavyweight' AND g.gender_name = 'Male'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Heavyweight', gender_id, 265, 120.2, 8
FROM dim_genders WHERE gender_name = 'Male'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Heavyweight' AND g.gender_name = 'Male'
);

-- Categorías femeninas
INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Strawweight', gender_id, 115, 52.2, 9
FROM dim_genders WHERE gender_name = 'Female'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Strawweight' AND g.gender_name = 'Female'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Flyweight', gender_id, 125, 56.7, 10
FROM dim_genders WHERE gender_name = 'Female'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Flyweight' AND g.gender_name = 'Female'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Bantamweight', gender_id, 135, 61.2, 11
FROM dim_genders WHERE gender_name = 'Female'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Bantamweight' AND g.gender_name = 'Female'
);

INSERT IGNORE INTO dim_weight_classes (class_name, gender_id, weight_limit_lbs, weight_limit_kg, display_order)
SELECT 'Featherweight', gender_id, 145, 65.8, 12
FROM dim_genders WHERE gender_name = 'Female'
AND NOT EXISTS (
    SELECT 1 FROM dim_weight_classes wc
    INNER JOIN dim_genders g ON wc.gender_id = g.gender_id
    WHERE wc.class_name = 'Featherweight' AND g.gender_name = 'Female'
);

-- Mensaje de confirmación
SELECT 'Datos iniciales cargados exitosamente' AS status;
SELECT COUNT(*) AS total_countries FROM dim_countries;
SELECT COUNT(*) AS total_weight_classes FROM dim_weight_classes;
SELECT COUNT(*) AS total_stances FROM dim_stances;
SELECT COUNT(*) AS total_event_types FROM dim_event_types;
SELECT COUNT(*) AS total_bonus_types FROM dim_bonus_types;
SELECT COUNT(*) AS total_fight_results FROM dim_fight_results;
SELECT COUNT(*) AS total_fight_methods FROM dim_fight_methods;
