// Opciones de los <select>. Los "value" son los mismos que acepta la API y la base
// (ver backend/validation.js y db/init.sql); los "label" son lo que ve el usuario.

export const ACTIVITY_TYPES = [
  { value: 'historia', label: 'Historia de usuario' },
  { value: 'tarea', label: 'Tarea' },
  { value: 'bug', label: 'Bug' },
  { value: 'mejora', label: 'Mejora' },
  { value: 'investigacion', label: 'Investigación' },
  { value: 'documentacion', label: 'Documentación' },
]

export const STATUSES = [
  { value: 'por_hacer', label: 'Por hacer' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'bloqueada', label: 'Bloqueada' },
  { value: 'finalizada', label: 'Finalizada' },
]

export const PRIORITIES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

export const FINISHED_STATUS = 'finalizada'

const toLabelMap = (options) => Object.fromEntries(options.map((o) => [o.value, o.label]))

export const ACTIVITY_LABELS = toLabelMap(ACTIVITY_TYPES)
export const STATUS_LABELS = toLabelMap(STATUSES)
export const PRIORITY_LABELS = toLabelMap(PRIORITIES)

// Fecha de hoy en la zona horaria del navegador, como 'YYYY-MM-DD' (formato de <input type="date">)
export const today = () => new Date().toLocaleDateString('en-CA')

// '2026-10-05' -> '05/10/2026'
export const formatDate = (value) => (value ? value.split('-').reverse().join('/') : '—')
