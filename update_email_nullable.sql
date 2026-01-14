-- Hacer el campo email nullable
ALTER TABLE users MODIFY COLUMN email VARCHAR(100) NULL;
