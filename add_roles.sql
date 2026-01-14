-- Agregar columna de role a la tabla users
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER email;

-- Crear un usuario admin de prueba
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
