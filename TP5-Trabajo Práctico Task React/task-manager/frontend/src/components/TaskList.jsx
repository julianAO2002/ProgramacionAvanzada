import { useMemo, useState } from 'react'
import {
  STATUSES,
  ACTIVITY_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  FINISHED_STATUS,
  formatDate,
} from '../constants.js'

function TaskCard({ task, isEditing, busy, onEdit, onFinish, onDelete }) {
  const isFinished = task.status === FINISHED_STATUS

  return (
    <article className={`task-card${isFinished ? ' is-finished' : ''}${isEditing ? ' is-editing' : ''}`}>
      <header className="task-card-header">
        <div className="task-card-project">
          <span className="task-id">#{task.id}</span>
          <span>{task.project_name}</span>
        </div>
        <span className={`status status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
      </header>

      <h3 className="task-summary">{task.summary}</h3>

      <div className="task-tags">
        <span className="tag">{ACTIVITY_LABELS[task.activity_type]}</span>
        <span className={`tag priority-${task.priority}`}>Prioridad {PRIORITY_LABELS[task.priority].toLowerCase()}</span>
        {task.sprint && <span className="tag">{task.sprint}</span>}
      </div>

      {task.description && <p className="task-text">{task.description}</p>}

      {task.precondition && (
        <p className="task-text task-precondition">
          <strong>Precondición:</strong> {task.precondition}
        </p>
      )}

      <dl className="task-meta">
        <div>
          <dt>Informador</dt>
          <dd>{task.reporter}</dd>
        </div>
        <div>
          <dt>Asignada a</dt>
          <dd>{task.assignee || <em>Sin asignar</em>}</dd>
        </div>
        <div>
          <dt>Creación</dt>
          <dd>{formatDate(task.created_date)}</dd>
        </div>
        <div>
          <dt>Cierre</dt>
          <dd>{formatDate(task.closed_date)}</dd>
        </div>
      </dl>

      <footer className="task-actions">
        <button type="button" className="btn btn-small" onClick={() => onEdit(task)} disabled={busy}>
          Editar
        </button>
        <button
          type="button"
          className="btn btn-small btn-success"
          onClick={() => onFinish(task)}
          disabled={busy || isFinished}
          title={isFinished ? 'La tarea ya está finalizada' : undefined}
        >
          {isFinished ? 'Finalizada' : 'Finalizar'}
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(task)} disabled={busy}>
          Eliminar
        </button>
      </footer>
    </article>
  )
}

export default function TaskList({ tasks, loading, editingId, busyId, onEdit, onFinish, onDelete }) {
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  // Cantidad de tareas por estado, para los contadores de los filtros
  const counts = useMemo(() => {
    const result = {}
    for (const task of tasks) result[task.status] = (result[task.status] || 0) + 1
    return result
  }, [tasks])

  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tasks.filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false
      if (!term) return true
      return [task.project_name, task.summary, task.assignee, task.reporter, task.sprint]
        .some((value) => value.toLowerCase().includes(term))
    })
  }, [tasks, statusFilter, search])

  return (
    <section className="card task-list" aria-labelledby="task-list-title">
      <div className="card-header">
        <h2 id="task-list-title">Listado de Tareas</h2>
        <span className="muted">
          {visibleTasks.length} de {tasks.length}
        </span>
      </div>

      <div className="task-filters">
        <div className="chips" role="group" aria-label="Filtrar por estado">
          <button
            type="button"
            className={`chip${statusFilter === '' ? ' is-active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Todas <span className="chip-count">{tasks.length}</span>
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`chip${statusFilter === s.value ? ' is-active' : ''}`}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.label} <span className="chip-count">{counts[s.value] || 0}</span>
            </button>
          ))}
        </div>

        <input
          type="search"
          className="search"
          placeholder="Buscar por proyecto, resumen, persona o sprint…"
          aria-label="Buscar tareas"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="empty">Cargando tareas…</p>
      ) : visibleTasks.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 ? 'Todavía no hay tareas. Creá la primera con el formulario.' : 'Ninguna tarea coincide con el filtro.'}
        </p>
      ) : (
        <div className="task-grid">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isEditing={task.id === editingId}
              busy={task.id === busyId}
              onEdit={onEdit}
              onFinish={onFinish}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
