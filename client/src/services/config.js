// Frontend runtime configuration.
// API_BASE points at the backend; override per-environment via VITE_API_BASE.
const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:4000/api'

export const config = {
  API_BASE,
  STORAGE_PREFIX: 'etest_',
  AUTH_USER_KEY: 'currentUser',
  AUTH_TOKEN_KEY: 'authToken',
}
