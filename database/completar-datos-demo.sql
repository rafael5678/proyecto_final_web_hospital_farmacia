-- Completa perfiles de Hospy para que coincidan con la web.
-- El administrador vive en usuarios + administradores, no en pacientes.

UPDATE usuarios SET telefono = '3001000001' WHERE email = 'admin@hospy.com';
UPDATE usuarios SET telefono = '3001112233' WHERE email = 'doctor@hospy.com';
UPDATE usuarios SET telefono = '3002223344' WHERE email = 'neurologia@hospy.com';
UPDATE usuarios SET telefono = '3003334455' WHERE email = 'dermatologia@hospy.com';
UPDATE usuarios SET telefono = COALESCE(NULLIF(telefono, ''), '3004445566'), nombre = 'Pedro Paciente'
  WHERE email = 'pedro@hospy.com';
UPDATE usuarios SET telefono = COALESCE(NULLIF(telefono, ''), '3005556677'), nombre = 'Juan Reyes'
  WHERE email = 'paciente@hospy.com';
UPDATE usuarios SET nombre = 'Camilo Peñasco' WHERE email = 'Camilopeña@gmail.com';

UPDATE administradores SET
  cargo = 'Gerencia General',
  departamento = 'Dirección Hospitalaria',
  extension_telefonica = '100'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'admin@hospy.com');

UPDATE medicos SET
  anos_experiencia = 12,
  consultorio = 'Consultorio 301',
  biografia = 'Especialista en cardiología clínica.'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'doctor@hospy.com');

UPDATE medicos SET
  anos_experiencia = 9,
  consultorio = 'Consultorio 210',
  biografia = 'Neuróloga clínica. Cefalea, epilepsia y seguimiento ambulatorio.'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'neurologia@hospy.com');

UPDATE medicos SET
  anos_experiencia = 8,
  consultorio = 'Consultorio 118',
  biografia = 'Dermatólogo. Lesiones de piel, infecciones cutáneas y orientación de triaje.'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'dermatologia@hospy.com');

UPDATE pacientes SET
  documento = 'CC-1001001001',
  fecha_nacimiento = '1996-03-12',
  genero = 'Masculino',
  tipo_sangre = 'O+',
  direccion = 'Calle 70 #12-20',
  ciudad = 'Cartagena',
  alergias = 'Ninguna',
  contacto_emergencia = 'Laura Paciente',
  telefono_emergencia = '3004445567',
  observaciones = 'Paciente demo del portal. Login: pedro@hospy.com'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'pedro@hospy.com');

UPDATE pacientes SET
  documento = 'CC-1002002002',
  fecha_nacimiento = '1994-08-21',
  genero = 'Masculino',
  tipo_sangre = 'A+',
  direccion = 'Cra 5 #31-14',
  ciudad = 'Cartagena',
  alergias = 'Ninguna',
  contacto_emergencia = 'María Reyes',
  telefono_emergencia = '3005556678',
  observaciones = 'Paciente demo del portal. Login: paciente@hospy.com'
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'paciente@hospy.com');

UPDATE pacientes SET
  alergias = 'Ninguna'
WHERE alergias ILIKE 'ninguna';

UPDATE pacientes SET
  observaciones = 'Registro de prueba del portal'
WHERE observaciones = 'wnajs';

INSERT INTO usuarios (nombre, email, password, rol, telefono, activo)
SELECT 'Juan Rafael', 'juanrafael@hospy.com',
       (SELECT password FROM usuarios WHERE email = 'pedro@hospy.com'),
       'PACIENTE', '3006667788', TRUE
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'juanrafael@hospy.com');

INSERT INTO pacientes (
  usuario_id, documento, fecha_nacimiento, genero, tipo_sangre, direccion, ciudad,
  alergias, contacto_emergencia, telefono_emergencia, observaciones
)
SELECT u.id, 'CC-1003003003', '1998-05-18', 'Masculino', 'O+',
       'Bocagrande, Cra 2 #8-45', 'Cartagena', 'Ninguna',
       'Rafael Familia', '3006667789',
       'Paciente del portal. Login: juanrafael@hospy.com / 123456'
FROM usuarios u
WHERE u.email = 'juanrafael@hospy.com'
  AND NOT EXISTS (SELECT 1 FROM pacientes p WHERE p.usuario_id = u.id);

INSERT INTO horarios (medico_id, dia_semana, hora_inicio, hora_fin, disponible)
SELECT m.id, d.dia, TIME '08:00', TIME '17:00', TRUE
FROM medicos m
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS d(dia)
WHERE NOT EXISTS (
  SELECT 1 FROM horarios h WHERE h.medico_id = m.id AND h.dia_semana = d.dia
);

CREATE OR REPLACE VIEW v_directorio AS
SELECT
  u.id AS usuario_id,
  u.nombre,
  u.email,
  u.rol,
  u.telefono,
  CASE WHEN u.activo THEN 'Activo' ELSE 'Inactivo' END AS estado,
  COALESCE(a.cargo, m.especialidad, 'Paciente') AS cargo_o_especialidad,
  COALESCE(a.departamento, m.consultorio, p.ciudad) AS sede,
  p.documento,
  m.numero_licencia
FROM usuarios u
LEFT JOIN administradores a ON a.usuario_id = u.id
LEFT JOIN medicos m ON m.usuario_id = u.id
LEFT JOIN pacientes p ON p.usuario_id = u.id;

CREATE OR REPLACE VIEW v_pacientes_completos AS
SELECT
  p.id AS paciente_id,
  u.nombre,
  u.email,
  u.telefono,
  p.documento,
  p.fecha_nacimiento,
  p.genero,
  p.tipo_sangre,
  p.ciudad,
  p.direccion,
  p.alergias,
  p.contacto_emergencia,
  p.telefono_emergencia,
  p.observaciones
FROM pacientes p
JOIN usuarios u ON u.id = p.usuario_id;

CREATE OR REPLACE VIEW v_medicos_completos AS
SELECT
  m.id AS medico_id,
  u.nombre,
  u.email,
  u.telefono,
  m.especialidad,
  m.numero_licencia,
  m.consultorio,
  m.anos_experiencia,
  m.biografia
FROM medicos m
JOIN usuarios u ON u.id = m.usuario_id;

CREATE OR REPLACE VIEW v_administradores_completos AS
SELECT
  a.id AS admin_id,
  u.nombre,
  u.email,
  u.telefono,
  a.cargo,
  a.departamento,
  a.extension_telefonica
FROM administradores a
JOIN usuarios u ON u.id = a.usuario_id;
