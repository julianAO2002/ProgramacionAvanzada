-- Se ejecuta automaticamente UNA SOLA VEZ, cuando Postgres crea el volumen por primera vez
-- (carpeta especial docker-entrypoint-initdb.d). Si el volumen ya existe, este script no
-- se vuelve a correr: para recrear la base hay que hacer "docker compose down -v".

CREATE TABLE IF NOT EXISTS tasks (
    id            SERIAL PRIMARY KEY,
    project_name  VARCHAR(120) NOT NULL,
    activity_type VARCHAR(30)  NOT NULL,
    status        VARCHAR(30)  NOT NULL DEFAULT 'por_hacer',
    summary       VARCHAR(200) NOT NULL,
    description   TEXT         NOT NULL DEFAULT '',
    priority      VARCHAR(20)  NOT NULL DEFAULT 'media',
    reporter      VARCHAR(120) NOT NULL,
    assignee      VARCHAR(120) NOT NULL DEFAULT '',
    precondition  TEXT         NOT NULL DEFAULT '',
    created_date  DATE         NOT NULL DEFAULT CURRENT_DATE,
    closed_date   DATE,
    sprint        VARCHAR(60)  NOT NULL DEFAULT '',
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),

    -- Las mismas reglas que valida la API, repetidas en la base como ultima linea de defensa
    CONSTRAINT tasks_activity_type_chk CHECK (activity_type IN ('historia', 'tarea', 'bug', 'mejora', 'investigacion', 'documentacion')),
    CONSTRAINT tasks_status_chk        CHECK (status IN ('por_hacer', 'en_progreso', 'en_revision', 'bloqueada', 'finalizada')),
    CONSTRAINT tasks_priority_chk      CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    -- Solo una tarea finalizada tiene fecha de cierre, y nunca puede ser anterior a la de creacion
    CONSTRAINT tasks_closed_date_chk   CHECK (
        (status = 'finalizada' AND closed_date IS NOT NULL AND closed_date >= created_date)
        OR (status <> 'finalizada' AND closed_date IS NULL)
    )
);

-- Datos de ejemplo para ver el listado con contenido apenas se levanta el proyecto
INSERT INTO tasks (project_name, activity_type, status, summary, description, priority, reporter, assignee, precondition, created_date, closed_date, sprint) VALUES
    ('Portal de Alumnos', 'historia', 'en_progreso', 'Login con usuario institucional',
     'Como alumno quiero ingresar con mi usuario de la facultad para no tener otra contrasena.',
     'alta', 'Laura Gomez', 'Julian Olivera', 'Tener acceso al servidor LDAP de pruebas', '2026-09-28', NULL, 'Sprint 3'),
    ('Portal de Alumnos', 'bug', 'por_hacer', 'El listado de materias no pagina',
     'Con mas de 50 materias la tabla muestra todas juntas y la pagina queda lenta.',
     'media', 'Martin Ruiz', '', 'Cargar un alumno con mas de 50 inscripciones', '2026-10-01', NULL, 'Sprint 3'),
    ('App de Turnos', 'tarea', 'finalizada', 'Configurar pipeline de CI',
     'Correr lint y tests en cada push a main.',
     'baja', 'Laura Gomez', 'Sofia Benitez', '', '2026-09-15', '2026-09-20', 'Sprint 2');
