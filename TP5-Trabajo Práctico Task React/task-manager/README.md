# TP5 - Task React

Manejador de tareas de proyectos de software: un formulario en **React + Vite** para
cargar tareas, el componente **"Listado de Tareas"** para verlas y las acciones
**Editar**, **Eliminar** y **Finalizar**. Los datos persisten en **PostgreSQL** y los
tres componentes (frontend, backend y base) corren en contenedores **Docker**.

## Stack

| Capa | Tecnología | Contenedor |
| --- | --- | --- |
| Frontend | React 19 + Vite 8, servido por nginx | `taskreact_web` (puerto 8080) |
| Backend | Node.js 24 + Express 5 + `pg` | `taskreact_api` (puerto 3001) |
| Base de datos | PostgreSQL 16 | `taskreact_db` (puerto 5433 en el host) |

```
navegador ──► web (nginx :80) ──/api/*──► api (Express :3001) ──► db (Postgres :5432)
                   └── archivos estáticos del build de Vite
```

nginx sirve el build de React y reenvía `/api/*` al backend, así el navegador habla con
un único origen y no hace falta configurar CORS.

## Estructura

```
task-manager/
├── backend/
│   ├── server.js          # Rutas REST /api/tasks
│   ├── validation.js      # Reglas de negocio de una tarea
│   ├── db.js              # Pool de conexiones a Postgres
│   └── Dockerfile         # Multi-stage, corre como usuario no root
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Estado global y acciones (crear/editar/finalizar/eliminar)
│   │   ├── components/TaskForm.jsx  # Formulario con los 12 campos
│   │   ├── components/TaskList.jsx  # "Listado de Tareas" con filtros
│   │   ├── api/tasks.js             # Cliente fetch de la API
│   │   ├── constants.js             # Opciones de los select y helpers de fechas
│   │   └── index.css
│   ├── nginx.conf         # Sirve la SPA y hace proxy de /api al backend
│   ├── vite.config.js     # Proxy /api para desarrollo local
│   └── Dockerfile         # Build con Node, imagen final con nginx
├── db/init.sql            # Tabla tasks + datos de ejemplo
├── docker-compose.yml
└── .env.example
```

## Cómo levantar

Requisitos: Docker Desktop (o Docker Engine + Compose v2).

```bash
cp .env.example .env
docker compose up -d --build
```

- App: <http://localhost:8080>
- API: <http://localhost:3001/api/tasks>

`db/init.sql` crea la tabla y carga tres tareas de ejemplo **solo la primera vez**
(cuando se crea el volumen). Para empezar de cero:

```bash
docker compose down -v     # borra también el volumen con los datos
docker compose up -d --build
```

### Desarrollo sin Docker para el frontend/backend

Con la base levantada (`docker compose up -d db`), en dos terminales:

```bash
# backend
cd backend && npm install
DB_PORT=5433 POSTGRES_USER=task_user POSTGRES_PASSWORD=task_pass POSTGRES_DB=task_db npm run dev

# frontend (Vite reenvía /api a localhost:3001)
cd frontend && npm install && npm run dev     # http://localhost:5173
```

## Campos del formulario

| Campo | Columna | Tipo / valores | Obligatorio |
| --- | --- | --- | --- |
| Nombre del Proyecto | `project_name` | texto (120) | Sí |
| Tipo de Actividad | `activity_type` | Historia de usuario, Tarea, Bug, Mejora, Investigación, Documentación | Sí (por defecto Tarea) |
| Estado | `status` | Por hacer, En progreso, En revisión, Bloqueada, Finalizada | Sí (por defecto Por hacer) |
| Resumen | `summary` | texto (200) | Sí |
| Descripción | `description` | texto libre | No |
| Prioridad | `priority` | Baja, Media, Alta, Crítica | Sí (por defecto Media) |
| Informador | `reporter` | texto (120) | Sí |
| Persona asignada | `assignee` | texto (120) | No |
| Precondición | `precondition` | texto libre | No |
| Fecha de Creación | `created_date` | fecha | Sí (por defecto hoy) |
| Fecha de Cierre | `closed_date` | fecha | Solo si está finalizada |
| Sprint | `sprint` | texto (60) | No |

## Reglas de negocio

Se validan en el frontend (feedback inmediato), en la API (`backend/validation.js`) y
con `CHECK` en la base, como última línea de defensa.

- La **fecha de creación** no puede ser futura.
- Solo una tarea **finalizada** tiene **fecha de cierre**:
  - al elegir "Finalizada" en el formulario se propone la fecha de hoy;
  - si se guarda finalizada sin fecha de cierre, la API usa la de hoy;
  - si una tarea finalizada se reabre (se cambia a otro estado), la fecha de cierre se borra.
- La fecha de cierre no puede ser futura ni anterior a la de creación.
- **Finalizar** pasa la tarea a "Finalizada" con cierre hoy. Si ya estaba finalizada,
  la API responde `409` y en el listado el botón aparece deshabilitado.
- **Eliminar** pide confirmación antes de borrar.
- El listado muestra primero las tareas abiertas, ordenadas por prioridad (Crítica →
  Baja) y fecha de creación, y al final las finalizadas (tachadas). Se puede filtrar
  por estado y buscar por proyecto, resumen, personas o sprint.

## API

| Método | Ruta | Descripción | Respuestas |
| --- | --- | --- | --- |
| GET | `/api/health` | Chequeo de vida (consulta la base) | 200 |
| GET | `/api/tasks` | Listar. Filtros opcionales `?status=` y `?project=` | 200, 400 |
| GET | `/api/tasks/:id` | Obtener una tarea | 200, 400, 404 |
| POST | `/api/tasks` | Crear | 201, 400 |
| PUT | `/api/tasks/:id` | Editar (reemplaza todos los campos) | 200, 400, 404 |
| PATCH | `/api/tasks/:id/finish` | Finalizar | 200, 400, 404, 409 |
| DELETE | `/api/tasks/:id` | Eliminar | 204, 400, 404 |

Los `400` por datos inválidos devuelven el error de cada campo, que el formulario
muestra debajo del input correspondiente:

```json
{
  "error": "Datos invalidos",
  "fields": {
    "summary": "El resumen es obligatorio",
    "closed_date": "La fecha de cierre no puede ser anterior a la de creacion"
  }
}
```

Ejemplo de alta:

```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"project_name":"Task React","activity_type":"bug","summary":"Probar alta","priority":"alta","reporter":"Julian"}'
```

## Problema conocido: antivirus que inspecciona HTTPS

Si `docker compose build` falla en `npm ci` con `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, la
causa suele ser un antivirus (por ejemplo, el escudo web de Avast) o un proxy
corporativo que intercepta HTTPS. El sistema confía en su certificado, pero el
contenedor no. Hay dos opciones: desactivar la inspección HTTPS mientras dura el build,
o agregar el certificado de esa CA a la imagen de build (`NODE_EXTRA_CA_CERTS`).
