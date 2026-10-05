// Cliente de la API. Usa rutas relativas (/api/...): en desarrollo las reenvia el proxy
// de Vite y en Docker las reenvia nginx al contenedor del backend.

const BASE_URL = '/api/tasks'

export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message)
    this.status = status
    // Errores por campo que devuelve la API en un 400: { summary: 'El resumen es obligatorio', ... }
    this.fields = fields
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.error || `Error ${response.status}`, response.status, data?.fields)
  }

  return data
}

export const getTasks = () => request('')

export const createTask = (task) =>
  request('', { method: 'POST', body: JSON.stringify(task) })

export const updateTask = (id, task) =>
  request(`/${id}`, { method: 'PUT', body: JSON.stringify(task) })

export const finishTask = (id) => request(`/${id}/finish`, { method: 'PATCH' })

export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' })
