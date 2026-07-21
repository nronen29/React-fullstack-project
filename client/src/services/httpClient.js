import { config } from './config.js'
import { storage } from './storage.js'

// Thin fetch wrapper: injects the JWT, parses JSON, and surfaces a clean
// Error(message) on non-2xx responses so callers can just try/catch.
async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = storage.get(config.AUTH_TOKEN_KEY)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${config.API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Cannot reach the server. Please try again later.')
  }

  if (response.status === 204) return null

  let payload = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const message = payload?.error?.message ?? `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
