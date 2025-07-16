-- Script para limpiar índices duplicados en la base de datos
-- Soluciona el error: "Too many keys specified; max 64 keys allowed"

USE chancafe_q_dev;

-- Mostrar todos los índices actuales en users
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'chancafe_q_dev' 
    AND TABLE_NAME = 'users'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Eliminar índices duplicados o problemáticos de la tabla users
-- (Ignora errores si los índices no existen)

-- Índices que podrían estar duplicados
DROP INDEX IF EXISTS users_email_unique ON users;
DROP INDEX IF EXISTS idx_users_email ON users;
DROP INDEX IF EXISTS users_email_key ON users;
DROP INDEX IF EXISTS email ON users;
DROP INDEX IF EXISTS email_unique ON users;

-- Otros índices que podrían estar duplicados
DROP INDEX IF EXISTS idx_users_status ON users;
DROP INDEX IF EXISTS status ON users;
DROP INDEX IF EXISTS users_status_key ON users;

DROP INDEX IF EXISTS idx_users_role ON users;
DROP INDEX IF EXISTS role ON users;
DROP INDEX IF EXISTS users_role_key ON users;

DROP INDEX IF EXISTS idx_users_name ON users;
DROP INDEX IF EXISTS users_name_key ON users;
DROP INDEX IF EXISTS name ON users;

-- Limpiar índices de otras tablas que podrían tener problemas similares

-- Tabla clients
DROP INDEX IF EXISTS clients_email_unique ON clients;
DROP INDEX IF EXISTS idx_clients_email ON clients;
DROP INDEX IF EXISTS clients_dni_unique ON clients;
DROP INDEX IF EXISTS idx_clients_dni ON clients;

-- Tabla credit_requests
DROP INDEX IF EXISTS idx_credit_requests_client_id ON credit_requests;
DROP INDEX IF EXISTS idx_credit_requests_user_id ON credit_requests;
DROP INDEX IF EXISTS idx_credit_requests_status ON credit_requests;

-- Mostrar el estado final de los índices
SELECT 
    TABLE_NAME,
    COUNT(*) as INDEX_COUNT
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'chancafe_q_dev'
GROUP BY TABLE_NAME
ORDER BY INDEX_COUNT DESC;

-- Mensaje de confirmación
SELECT 'Limpieza de índices completada' as MESSAGE;