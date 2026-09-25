-- Sistema Hospy - Esquema completo (6 tablas)
-- Ejecutar en pgAdmin sobre la base de datos de Railway/Render

-- 1. Usuarios generales (login JWT)
CREATE TABLE IF NOT EXISTS usuarios (
    id         BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    rol        VARCHAR(255) NOT NULL CHECK (rol IN ('PACIENTE','MEDICO','ADMIN')),
    telefono   VARCHAR(255),
    activo     BOOLEAN DEFAULT TRUE
);

-- 2. Perfiles por rol
CREATE TABLE IF NOT EXISTS pacientes (
    id                  BIGSERIAL PRIMARY KEY,
    usuario_id          BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    documento           VARCHAR(255),
    fecha_nacimiento    DATE,
    genero              VARCHAR(255),
    tipo_sangre         VARCHAR(255),
    direccion           VARCHAR(255),
    ciudad              VARCHAR(255),
    alergias            VARCHAR(255),
    contacto_emergencia VARCHAR(255),
    telefono_emergencia VARCHAR(255),
    observaciones       VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS medicos (
    id                BIGSERIAL PRIMARY KEY,
    usuario_id        BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    especialidad      VARCHAR(255) NOT NULL,
    numero_licencia   VARCHAR(255),
    consultorio       VARCHAR(255),
    anos_experiencia  INTEGER,
    biografia         VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS administradores (
    id                     BIGSERIAL PRIMARY KEY,
    usuario_id             BIGINT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    cargo                  VARCHAR(255),
    departamento           VARCHAR(255),
    extension_telefonica   VARCHAR(255)
);

-- 3. Citas y horarios
CREATE TABLE IF NOT EXISTS horarios (
    id          BIGSERIAL PRIMARY KEY,
    medico_id   BIGINT NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    dia_semana  INTEGER NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin    TIME NOT NULL,
    disponible  BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS citas (
    id          BIGSERIAL PRIMARY KEY,
    paciente_id BIGINT NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    medico_id   BIGINT NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
    fecha_hora  TIMESTAMP NOT NULL,
    estado      VARCHAR(255) NOT NULL,
    motivo      VARCHAR(255),
    notas       VARCHAR(255)
);

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;
