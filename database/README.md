# Hospy — Base de datos

Scripts SQL del portal hospitalario (PostgreSQL 16).

## Archivos

- `init-schema.sql` — esquema inicial (usuarios, pacientes, médicos, citas, horarios).
- `completar-datos-demo.sql` — perfiles completos + vistas legibles (`v_directorio`, `v_pacientes_completos`, `v_medicos_completos`, `v_administradores_completos`).

En DBeaver no busques al administrador dentro de `pacientes`. Ábrelo en `usuarios` / `administradores`, o mejor en la vista `v_directorio`.

## Render

El backend usa Hibernate `ddl-auto=update` sobre PostgreSQL de Render. Este repo documenta el modelo para el curso.

No subas contraseñas. Las credenciales van solo en el panel de Render.
