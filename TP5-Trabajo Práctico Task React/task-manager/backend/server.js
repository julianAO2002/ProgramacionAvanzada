/**
 * TP5 - Task React: API REST de tareas de proyectos de software
 *
 * Endpoints (todos bajo /api):
 *   GET    /api/health             Chequeo de vida (usa la base)
 *   GET    /api/tasks              Listar (filtros opcionales ?status=&project=)
 *   GET    /api/tasks/:id          Obtener una tarea
 *   POST   /api/tasks              Crear
 *   PUT    /api/tasks/:id          Editar (reemplaza todos los campos del formulario)
 *   PATCH  /api/tasks/:id/finish   Finalizar (estado "finalizada" + fecha de cierre hoy)
 *   DELETE /api/tasks/:id          Eliminar
 */

import express from 'express'
import { pool } from './db.js'
import { validateTask, today, STATUSES, FINISHED_STATUS } from './validation.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

const router = express.Router()

// Valida que :id sea un entero positivo antes de llegar a la query (si no, Postgres
// responde con un error de tipo y terminariamos devolviendo un 500)
router.param('id', (req, res, next, id) => {
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'El id debe ser un numero entero' })
    }
    next()
})

router.get('/health', async (req, res) => {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
})

// GET /tasks - Listar tareas; primero las abiertas, por prioridad, y al final las finalizadas
router.get('/tasks', async (req, res) => {
    const { status, project } = req.query

    if (status && !STATUSES.includes(status)) {
        return res.status(400).json({ error: `El estado debe ser uno de: ${STATUSES.join(', ')}` })
    }

    const result = await pool.query(
        `SELECT * FROM tasks
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2::text IS NULL OR project_name ILIKE '%' || $2 || '%')
         ORDER BY (status = 'finalizada'),
                  CASE priority WHEN 'critica' THEN 0 WHEN 'alta' THEN 1 WHEN 'media' THEN 2 ELSE 3 END,
                  created_date DESC,
                  id DESC`,
        [status || null, project || null]
    )
    res.json(result.rows)
})

// GET /tasks/:id - Obtener una tarea
router.get('/tasks/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json(result.rows[0])
})

// POST /tasks - Crear una tarea
router.post('/tasks', async (req, res) => {
    const { errors, task } = validateTask(req.body)

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'Datos invalidos', fields: errors })
    }

    const result = await pool.query(
        `INSERT INTO tasks (project_name, activity_type, status, summary, description, priority,
                            reporter, assignee, precondition, created_date, closed_date, sprint)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
            task.project_name, task.activity_type, task.status, task.summary, task.description, task.priority,
            task.reporter, task.assignee, task.precondition, task.created_date, task.closed_date, task.sprint,
        ]
    )

    res.status(201).json(result.rows[0])
})

// PUT /tasks/:id - Editar una tarea. El formulario siempre manda todos los campos,
// asi que se reemplazan completos (con las mismas validaciones que el alta)
router.put('/tasks/:id', async (req, res) => {
    const { errors, task } = validateTask(req.body)

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'Datos invalidos', fields: errors })
    }

    const result = await pool.query(
        `UPDATE tasks
         SET project_name = $1, activity_type = $2, status = $3, summary = $4, description = $5,
             priority = $6, reporter = $7, assignee = $8, precondition = $9, created_date = $10,
             closed_date = $11, sprint = $12, updated_at = NOW()
         WHERE id = $13
         RETURNING *`,
        [
            task.project_name, task.activity_type, task.status, task.summary, task.description, task.priority,
            task.reporter, task.assignee, task.precondition, task.created_date, task.closed_date, task.sprint,
            req.params.id,
        ]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json(result.rows[0])
})

// PATCH /tasks/:id/finish - Finalizar una tarea. La fecha de cierre es hoy (o la de
// creacion, si por algun motivo fuera posterior, para no romper la regla de fechas)
router.patch('/tasks/:id/finish', async (req, res) => {
    const result = await pool.query(
        `UPDATE tasks
         SET status = $1, closed_date = GREATEST($2::date, created_date), updated_at = NOW()
         WHERE id = $3 AND status <> $1
         RETURNING *`,
        [FINISHED_STATUS, today(), req.params.id]
    )

    if (result.rows.length === 0) {
        // Distinguimos "no existe" de "ya estaba finalizada"
        const exists = await pool.query('SELECT 1 FROM tasks WHERE id = $1', [req.params.id])
        return exists.rows.length === 0
            ? res.status(404).json({ error: 'Tarea no encontrada' })
            : res.status(409).json({ error: 'La tarea ya esta finalizada' })
    }

    res.json(result.rows[0])
})

// DELETE /tasks/:id - Eliminar una tarea
router.delete('/tasks/:id', async (req, res) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id])

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.status(204).send()
})

app.use('/api', router)

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
})

// Express 5 deriva aca los errores de los handlers async (incluido un JSON mal formado)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El cuerpo del pedido no es un JSON valido' })
    }
    console.error(err)
    res.status(500).json({ error: 'Error interno del servidor' })
})

app.listen(PORT, () => {
    console.log(`🚀 API escuchando en http://localhost:${PORT}`)
    console.log('📝 Endpoints disponibles en /api/tasks')
})
