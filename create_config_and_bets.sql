-- Tabla de configuración global
CREATE TABLE IF NOT EXISTS app_config (
    config_id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración inicial
INSERT INTO app_config (config_key, config_value, description) VALUES 
('betting_enabled', 'false', 'Controla si las apuestas están habilitadas'),
('current_event_id', '0', 'ID del evento actual para apuestas')
ON DUPLICATE KEY UPDATE config_key=config_key;

-- Tabla de apuestas de usuarios
CREATE TABLE IF NOT EXISTS user_bets (
    bet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    fight_id INT NOT NULL,
    predicted_winner_id INT NOT NULL,
    bet_amount DECIMAL(10,2) DEFAULT 100.00,
    potential_return DECIMAL(10,2),
    odds_value DECIMAL(5,2),
    status ENUM('pending', 'won', 'lost', 'cancelled') DEFAULT 'pending',
    result_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (fight_id) REFERENCES fact_fights(fight_id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_winner_id) REFERENCES dim_fighters(fighter_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_fight_bet (user_id, fight_id),
    INDEX idx_user_bets (user_id),
    INDEX idx_fight_bets (fight_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
