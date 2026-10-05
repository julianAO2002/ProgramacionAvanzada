import { useState } from 'react'
import { ACTIVITY_TYPES, STATUSES, PRIORITIES, FINISHED_STATUS, today } from '../constants.js'

const emptyTask = () => ({
  project_name: '',
  activity_type: 'tarea',
  status: 'por_hacer',
  summary: '',
  description: '',
  priority: 'media',
  reporter: '',
  assignee: '',
  precondition: '',
  created_date: today(),
  closed_date: '',
  sprint: '',
})

// Pasa una tarea que viene de la API al formato del formulario (null -> '')
const toFormValues = (task) => {
  const values = emptyTask()
  for (const key of Object.keys(values)) {
    values[key] = task[key] ?? ''
  }
  return values
}

// Mismas reglas que backend/validation.js, para avisar antes de ir al servidor.
// El backend vuelve a validar todo igual: esto es solo para dar feedback inmediato.
function validate(values) {
  const errors = {}
  const currentDate = today()

  if (!values.project_name.trim()) errors.project_name = 'El nombre del proyecto es obligatorio'
  if (!values.summary.trim()) errors.summary = 'El resumen es obligatorio'
  if (!values.reporter.trim()) errors.reporter = 'El informador es obligatorio'

  if (!values.created_date) errors.created_date = 'La fecha de creación es obligatoria'
  else if (values.created_date > currentDate) errors.created_date = 'No puede ser una fecha futura'

  if (values.status === FINISHED_STATUS && values.closed_date) {
    if (values.closed_date > currentDate) errors.closed_date = 'No puede ser una fecha futura'
    else if (values.closed_date < values.created_date) {
      errors.closed_date = 'No puede ser anterior a la fecha de creación'
    }
  }

  return errors
}

export default function TaskForm({ task, onSubmit, onCancel }) {
  const isEditing = Boolean(task)
  const [values, setValues] = useState(() => (task ? toFormValues(task) : emptyTask()))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const isFinished = values.status === FINISHED_STATUS

  function handleChange(event) {
    const { name, value } = event.target

    setValues((prev) => {
      const next = { ...prev, [name]: value }

      // Regla de negocio: la fecha de cierre solo existe si la tarea esta finalizada.
      // Al pasar a "Finalizada" se propone hoy; al salir de ese estado se borra.
      if (name === 'status') {
        if (value === FINISHED_STATUS && !prev.closed_date) next.closed_date = today()
        if (value !== FINISHED_STATUS) next.closed_date = ''
      }
      return next
    })

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validate(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
      if (!isEditing) {
        setValues(emptyTask())
        setErrors({})
      }
    } catch (err) {
      // Si la API rechazo algun campo, lo marcamos en su input
      setErrors(err.fields || {})
    } finally {
      setSubmitting(false)
    }
  }

  // Props comunes de cada input: valor, onChange y marca de error accesible
  const field = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  })

  const error = (name) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name]}
      </span>
    )

  return (
    <form className="card task-form" onSubmit={handleSubmit} noValidate>
      <div className="card-header">
        <h2>{isEditing ? `Editar tarea #${task.id}` : 'Nueva tarea'}</h2>
        {isEditing && <span className="badge badge-editing">Editando</span>}
      </div>

      <div className="form-grid">
        <label className="field span-2" htmlFor="project_name">
          <span>Nombre del Proyecto *</span>
          <input type="text" maxLength={120} placeholder="Ej: Portal de Alumnos" {...field('project_name')} />
          {error('project_name')}
        </label>

        <label className="field" htmlFor="activity_type">
          <span>Tipo de Actividad</span>
          <select {...field('activity_type')}>
            {ACTIVITY_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {error('activity_type')}
        </label>

        <label className="field" htmlFor="sprint">
          <span>Sprint</span>
          <input type="text" maxLength={60} placeholder="Ej: Sprint 3" {...field('sprint')} />
          {error('sprint')}
        </label>

        <label className="field" htmlFor="status">
          <span>Estado</span>
          <select {...field('status')}>
            {STATUSES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {error('status')}
        </label>

        <label className="field" htmlFor="priority">
          <span>Prioridad</span>
          <select {...field('priority')}>
            {PRIORITIES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {error('priority')}
        </label>

        <label className="field" htmlFor="created_date">
          <span>Fecha de Creación</span>
          <input type="date" max={today()} {...field('created_date')} />
          {error('created_date')}
        </label>

        <label className="field" htmlFor="closed_date">
          <span>Fecha de Cierre</span>
          <input
            type="date"
            min={values.created_date || undefined}
            max={today()}
            disabled={!isFinished}
            {...field('closed_date')}
          />
          {error('closed_date') || (!isFinished && <span className="field-hint">Se completa al finalizar la tarea</span>)}
        </label>

        <label className="field span-full" htmlFor="summary">
          <span>Resumen *</span>
          <input type="text" maxLength={200} placeholder="Título corto de la tarea" {...field('summary')} />
          {error('summary')}
        </label>

        <label className="field span-2" htmlFor="description">
          <span>Descripción</span>
          <textarea rows={4} placeholder="Qué hay que hacer y por qué" {...field('description')} />
          {error('description')}
        </label>

        <label className="field span-2" htmlFor="precondition">
          <span>Precondición</span>
          <textarea rows={4} placeholder="Qué tiene que cumplirse antes de empezar" {...field('precondition')} />
          {error('precondition')}
        </label>

        <label className="field span-2" htmlFor="reporter">
          <span>Informador *</span>
          <input type="text" maxLength={120} placeholder="Quién reporta la tarea" {...field('reporter')} />
          {error('reporter')}
        </label>

        <label className="field span-2" htmlFor="assignee">
          <span>Persona asignada</span>
          <input type="text" maxLength={120} placeholder="Sin asignar" {...field('assignee')} />
          {error('assignee')}
        </label>
      </div>

      <div className="form-actions">
        {isEditing && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
        </button>
      </div>
    </form>
  )
}
