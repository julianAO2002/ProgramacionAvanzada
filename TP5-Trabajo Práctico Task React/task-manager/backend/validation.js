/**
 * Reglas de negocio de una tarea.
 *
 * validateTask() recibe el body crudo del pedido y devuelve { errors, task }:
 * - errors: objeto { campo: mensaje } (vacio si todo esta bien), pensado para que el
 *   frontend pueda marcar cada input con su error.
 * - task: los datos ya normalizados (strings recortados, defaults aplicados y la fecha
 *   de cierre resuelta segun el estado), listos para el INSERT / UPDATE.
 */

export const ACTIVITY_TYPES = ['historia', 'tarea', 'bug', 'mejora', 'investigacion', 'documentacion']
export const STATUSES = ['por_hacer', 'en_progreso', 'en_revision', 'bloqueada', 'finalizada']
export const PRIORITIES = ['baja', 'media', 'alta', 'critica']

export const FINISHED_STATUS = 'finalizada'

// Largos maximos, iguales a los VARCHAR de db/init.sql
const MAX_LENGTHS = {
    project_name: 120,
    summary: 200,
    reporter: 120,
    assignee: 120,
    sprint: 60,
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Fecha de hoy como 'YYYY-MM-DD' en la zona horaria del proceso (variable TZ)
export const today = () => new Date().toLocaleDateString('en-CA')

const isValidDate = (value) => {
    if (!DATE_REGEX.test(value)) return false
    const date = new Date(`${value}T00:00:00Z`)
    // Descarta fechas imposibles como 2026-02-30, que Date "corre" al mes siguiente
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

const text = (value) => (typeof value === 'string' ? value.trim() : '')

export function validateTask(body = {}) {
    const errors = {}

    const task = {
        project_name: text(body.project_name),
        activity_type: text(body.activity_type),
        status: text(body.status) || 'por_hacer',
        summary: text(body.summary),
        description: text(body.description),
        priority: text(body.priority) || 'media',
        reporter: text(body.reporter),
        assignee: text(body.assignee),
        precondition: text(body.precondition),
        created_date: text(body.created_date) || today(),
        closed_date: text(body.closed_date) || null,
        sprint: text(body.sprint),
    }

    // Obligatorios
    if (!task.project_name) errors.project_name = 'El nombre del proyecto es obligatorio'
    if (!task.summary) errors.summary = 'El resumen es obligatorio'
    if (!task.reporter) errors.reporter = 'El informador es obligatorio'

    // Valores de lista
    if (!ACTIVITY_TYPES.includes(task.activity_type)) {
        errors.activity_type = `El tipo de actividad debe ser uno de: ${ACTIVITY_TYPES.join(', ')}`
    }
    if (!STATUSES.includes(task.status)) {
        errors.status = `El estado debe ser uno de: ${STATUSES.join(', ')}`
    }
    if (!PRIORITIES.includes(task.priority)) {
        errors.priority = `La prioridad debe ser una de: ${PRIORITIES.join(', ')}`
    }

    // Largos maximos
    for (const [field, max] of Object.entries(MAX_LENGTHS)) {
        if (task[field].length > max && !errors[field]) {
            errors[field] = `Maximo ${max} caracteres`
        }
    }

    // Fechas
    const currentDate = today()

    if (!isValidDate(task.created_date)) {
        errors.created_date = 'Fecha de creacion invalida (formato AAAA-MM-DD)'
    } else if (task.created_date > currentDate) {
        errors.created_date = 'La fecha de creacion no puede ser futura'
    }

    if (task.status === FINISHED_STATUS) {
        // Una tarea finalizada siempre tiene fecha de cierre: si no la mandan, es hoy
        task.closed_date ??= currentDate

        if (!isValidDate(task.closed_date)) {
            errors.closed_date = 'Fecha de cierre invalida (formato AAAA-MM-DD)'
        } else if (task.closed_date > currentDate) {
            errors.closed_date = 'La fecha de cierre no puede ser futura'
        } else if (!errors.created_date && task.closed_date < task.created_date) {
            errors.closed_date = 'La fecha de cierre no puede ser anterior a la de creacion'
        }
    } else {
        // Si la tarea no esta finalizada (o se reabre) no tiene fecha de cierre
        task.closed_date = null
    }

    return { errors, task }
}
