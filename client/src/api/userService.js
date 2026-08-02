import { http } from '../services/httpClient.js'

// Returns { token, user } from the backend.
export async function login(username, password) {
  return http.post('/auth/login', { username, password }, { auth: false })
}

// Registers a student, returns { token, user }.
export async function register({ username, password, fullName, email }) {
  return http.post('/auth/register', { username, password, fullName, email }, { auth: false })
}

// Returns the currently authenticated user via the stored token.
export async function getCurrentUser() {
  const data = await http.get('/auth/me')
  return data.user
}
