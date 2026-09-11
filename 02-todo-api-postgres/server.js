/**
 * 02 - TODO API con Postgres
 * Nivel: Intermedio
 *
 * Objetivo:
 * - Reemplazar el array en memoria de la practica 01 por persistencia real en Postgres
 * - Levantar Node + Postgres juntos con Docker Compose (dos contenedores, una red)
 * - Usar el driver "pg" con queries parametrizadas (evitar SQL injection)
 * - Comprobar que los datos sobreviven a un restart del contenedor de la API
 *   (mientras no se borre el volumen de Postgres)
 *
 * Requisitos previos: Docker y Docker Compose instalados.
 * Como correr esta practica: ver README.md
 */

import express from 'express'
import { pool } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

const VALID_STATUSES = ['pending', 'completed']

// GET /tasks - Listar todas las tareas (filtro opcional ?status=pending, paginacion ?limit=&offset=)
app.get('/tasks', async (req, res) => {
    try {
        const { status } = req.query

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
        }

        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)
        const offset = parseInt(req.query.offset, 10) || 0

        const result = status
            ? await pool.query('SELECT * FROM tasks WHERE status = $1 ORDER BY id LIMIT $2 OFFSET $3', [status, limit, offset])
            : await pool.query('SELECT * FROM tasks ORDER BY id LIMIT $1 OFFSET $2', [limit, offset])
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /tasks/:id - Obtener una tarea por id
app.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// POST /tasks - Crear una nueva tarea
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, status, dueDate } = req.body

        if (!title) {
            return res.status(400).json({ error: 'Title is required' })
        }

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
        }

        const result = await pool.query(
            `INSERT INTO tasks (title, description, status, due_date)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title, description || '', status || 'pending', dueDate || null]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PUT /tasks/:id - Actualizar una tarea existente
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { title, description, status, dueDate } = req.body

        if (status && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` })
        }

        const result = await pool.query(
            `UPDATE tasks
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 due_date = COALESCE($4, due_date),
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [title, description, status, dueDate, id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// DELETE /tasks/:id - Eliminar una tarea
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.status(204).send()
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`📝 API endpoints available at /tasks`)
})
