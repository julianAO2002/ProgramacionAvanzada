# TP03 - TODO API con Persistencia en PostgreSQL usando Docker

Practica 02 de Programacion Avanzada (LSI - FCyT UNER). Extiende la TODO API
de la practica 01, que guardaba las tareas en un array en memoria, para
persistirlas en PostgreSQL. La API y la base corren como contenedores
separados, orquestados con Docker Compose.

## Stack

- Node.js 20 + Express 5
- PostgreSQL 16 (driver `pg`, sin ORM)
- Docker + Docker Compose

## Arquitectura

```
┌──────────────────────┐         ┌──────────────────────┐
│  Contenedor "api"    │   SQL   │  Contenedor "db"     │
│  Node.js + Express   │ ──────► │  PostgreSQL 16       │
│  localhost:3001      │  (pg)   │  localhost:5432      │
└──────────────────────┘         └──────────┬───────────┘
                                            │
                                   volumen: todo_pgdata
```

Dentro de la red de Compose la API se conecta a la base usando el **nombre del
servicio** (`DB_HOST=db`), nunca `localhost`: dentro de un contenedor
`localhost` apunta al propio contenedor. Desde el host, en cambio, la base si
es accesible como `localhost:5432` por el mapeo de puertos.

El arranque esta ordenado con un `healthcheck` sobre `db` (via `pg_isready`) y
`depends_on: condition: service_healthy` en `api`, para que la API no intente
conectarse antes de que Postgres acepte conexiones.

## Estructura

```
02-todo-api-postgres/
├── db/
│   └── init.sql                          # Crea la tabla tasks (corre 1 sola vez)
├── capturas/                             # Evidencia de las pruebas
├── db.js                                 # Pool de conexion a Postgres
├── server.js                             # API Express
├── Dockerfile                            # Imagen de la API (multi-stage)
├── docker-compose.yml                    # Orquesta API + Postgres
├── .env.example                          # Copiar a .env
├── package.json
└── TP03-Informe-TODO-API-Postgres.pdf    # Informe de la practica
```

## Como correr

```bash
cp .env.example .env
docker compose up --build
```

La API queda en `http://localhost:3001/tasks`. Para frenar todo:

```bash
docker compose down      # los datos sobreviven (volumen intacto)
docker compose down -v   # borra tambien el volumen y los datos
```

## Endpoints

| Metodo | Ruta | Body | Codigos |
|---|---|---|---|
| GET | `/tasks` | — | 200 / 400 |
| GET | `/tasks/:id` | — | 200 / 404 |
| POST | `/tasks` | `{ title, description?, status?, dueDate? }` | 201 / 400 |
| PUT | `/tasks/:id` | `{ title?, description?, status?, dueDate? }` | 200 / 400 / 404 |
| DELETE | `/tasks/:id` | — | 204 / 404 |

`GET /tasks` acepta los query params `status`, `limit` y `offset`.

### Ejemplos

```bash
curl http://localhost:3001/tasks
curl "http://localhost:3001/tasks?status=pending"
curl "http://localhost:3001/tasks?limit=5&offset=10"
curl http://localhost:3001/tasks/1

curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Nueva tarea","description":"probando","status":"pending"}'

curl -X PUT http://localhost:3001/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

curl -X DELETE http://localhost:3001/tasks/1
```

## Detalles de implementacion

**PUT con COALESCE**: la actualizacion conserva los valores existentes de los
campos que no vengan en el body. `COALESCE` devuelve el primer argumento no
nulo, asi que un campo ausente (que el driver traduce a `NULL`) deja la columna
como estaba. `updated_at` se refresca con `NOW()` en cada update.

**RETURNING \***: tanto el PUT como el DELETE lo usan para distinguir si la fila
existia. Si no vuelve ninguna fila, el `id` no existia y se responde 404. En una
sola consulta se resuelve la operacion, la deteccion del 404 y la obtencion del
registro resultante.

**Queries parametrizadas**: ninguna consulta concatena valores del usuario en el
string SQL. Todas usan parametros posicionales (`$1`, `$2`, ...) con los valores
en un array aparte, de modo que Postgres siempre los interpreta como datos y
nunca como codigo ejecutable.

## Persistencia

Los datos viven en el volumen `todo_pgdata`, no en el contenedor de la API:

```bash
docker compose restart api   # los datos siguen ahi
docker compose down -v       # aca si se pierden (se borra el volumen)
```

El contenedor `api` no guarda estado: solo traduce HTTP a SQL. Por eso reiniciarlo
no afecta los datos, a diferencia de la practica 01 donde las tareas vivian en un
array en la memoria del proceso. La unidad de persistencia es el volumen, no el
contenedor.

## Bonus implementados

- **Validacion de `status`**: solo se aceptan `pending` y `completed`; cualquier
  otro valor devuelve 400. Se valida en el POST, el PUT y el filtro del GET.
- **Paginacion**: `GET /tasks` acepta `limit` (default 20, tope 100) y `offset`.
- **Dockerfile multi-stage**: una etapa resuelve dependencias y la final copia
  solo `node_modules` y el codigo, sin la cache de npm.

## Troubleshooting

- **Puerto 5432 ocupado**: si tenes Postgres corriendo localmente, cambia el
  mapeo en `docker-compose.yml` (por ejemplo `"5433:5432"`).
- **Cambios en `server.js` no se reflejan**: la imagen se construye una sola vez;
  despues de editar hay que correr `docker compose up --build`.
- **`init.sql` no crea la tabla**: ese script solo corre al crear el volumen. Si
  ya habias levantado el proyecto, borra el volumen con `docker compose down -v`.
- **Postman devuelve 404 con la ruta correcta**: revisa que no haya saltos de
  linea o espacios al final de la URL; se codifican como `%0A` y la ruta deja de
  matchear.
