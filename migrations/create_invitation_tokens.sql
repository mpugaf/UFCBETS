-- Migration: Create invitation_tokens table
-- Date: 2026-01-21
-- Description: Sistema de invitaciones con token único para evitar múltiples registros no autorizados

CREATE TABLE invitation_tokens (
  token_id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NULL COMMENT 'Email opcional para vincular token a usuario específico',
  created_by INT NOT NULL COMMENT 'Admin que generó la invitación',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL COMMENT 'Fecha de expiración (default 7 días)',
  used_at TIMESTAMP NULL COMMENT 'Cuándo se usó el token',
  used_by INT NULL COMMENT 'Usuario que usó el token',
  revoked_at TIMESTAMP NULL COMMENT 'Cuándo se revocó (si aplica)',
  revoked_by INT NULL COMMENT 'Admin que revocó el token',
  notes TEXT NULL COMMENT 'Notas sobre la invitación',

  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (used_by) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (revoked_by) REFERENCES users(user_id) ON DELETE SET NULL,

  INDEX idx_token (token),
  INDEX idx_created_by (created_by),
  INDEX idx_used_at (used_at),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tokens de invitación para registro de nuevos usuarios';

-- Verificar la creación
SELECT 'Tabla invitation_tokens creada exitosamente' as status;
DESCRIBE invitation_tokens;
