import { useCallback, useEffect, useRef, useState } from 'react'
import TaskForm from './components/TaskForm.jsx'
import TaskList from './components/TaskList.jsx'
import { getTasks, createTask, updateTask, finishTask, deleteTask } from './api/tasks.js'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }
  const formRef = useRef(null)

  const notify = useCallback((type, text) => setNotice({ type, text }), [])

  // Los avisos se ocultan solos despues de unos segundos
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(timer)
  }, [notice])

  // El orden del listado lo define la API, asi que despues de cada cambio se vuelve a pedir
  const loadTasks = useCallback(async () => {
    try {
      setTasks(await getTasks())
    } catch (err) {
      notify('error', `No se pudieron cargar las tareas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleSubmit(values) {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values)
        notify('success', `Tarea #${editingTask.id} actualizada`)
        setEditingTask(null)
      } else {
        const created = await createTask(values)
        notify('success', `Tarea #${created.id} creada`)
      }
      await loadTasks()
    } catch (err) {
      notify('error', err.message)
      throw err // el formulario lo usa para marcar los campos con error
    }
  }

  function handleEdit(task) {
    setEditingTask(task)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleFinish(task) {
    setBusyId(task.id)
    try {
      await finishTask(task.id)
      notify('success', `Tarea #${task.id} finalizada`)
      // Si se estaba editando, se cierra el formulario para no pisar el cambio con datos viejos
      if (editingTask?.id === task.id) setEditingTask(null)
      await loadTasks()
    } catch (err) {
      notify('error', err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`¿Eliminar la tarea #${task.id} "${task.summary}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setBusyId(task.id)
    try {
      await deleteTask(task.id)
      notify('success', `Tarea #${task.id} eliminada`)
      if (editingTask?.id === task.id) setEditingTask(null)
      await loadTasks()
    } catch (err) {
      notify('error', err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Task React</h1>
          <p className="muted">Manejador de tareas de proyectos de software</p>
        </div>
      </header>

      {notice && (
        <div className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          {notice.text}
        </div>
      )}

      <main className="app-main">
        <div ref={formRef} className="form-anchor">
          {/* La key fuerza a reiniciar el estado del formulario al cambiar de tarea */}
          <TaskForm
            key={editingTask?.id ?? 'new'}
            task={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
        </div>

        <TaskList
          tasks={tasks}
          loading={loading}
          editingId={editingTask?.id}
          busyId={busyId}
          onEdit={handleEdit}
          onFinish={handleFinish}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}
