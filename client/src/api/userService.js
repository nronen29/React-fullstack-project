import { mockDb } from './mockDb.js'
import { config } from '../services/config.js'

const delay = (ms = config.MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

export function toPublicUser(user) {
  if (!user) return null
  const publicUser = { ...user }
  delete publicUser.password
  return publicUser
}

function nextUserId(role) {
  const prefix = role === 'teacher' ? 'user-teacher-' : 'user-student-'
  const nums = mockDb.users
    .filter((u) => u.id.startsWith(prefix))
    .map((u) => {
      const m = u.id.match(/(\d+)$/)
      return m ? parseInt(m[1], 10) : 0
    })
  const max = nums.length ? Math.max(...nums) : 0
  return `${prefix}${max + 1}`
}

export async function login(username, password) {
  await delay()
  const normalized = username.trim().toLowerCase()
  const user = mockDb.users.find((u) => u.username.toLowerCase() === normalized)
  if (!user || user.password !== password) {
    throw new Error('Invalid username or password')
  }
  return toPublicUser(user)
}

export async function register({ username, password, fullName, email }) {
  await delay()
  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedUsername || !password || !fullName.trim() || !normalizedEmail) {
    throw new Error('All fields are required')
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters')
  }

  const usernameTaken = mockDb.users.some((u) => u.username.toLowerCase() === normalizedUsername)
  if (usernameTaken) {
    throw new Error('Username is already taken')
  }

  const emailTaken = mockDb.users.some((u) => u.email.toLowerCase() === normalizedEmail)
  if (emailTaken) {
    throw new Error('Email is already registered')
  }

  const newUser = {
    id: nextUserId('student'),
    username: normalizedUsername,
    password,
    role: 'student',
    fullName: fullName.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
  }

  mockDb.users.push(newUser)
  return toPublicUser(newUser)
}

export async function getUserById(id) {
  await delay()
  const user = mockDb.users.find((u) => u.id === id)
  return toPublicUser(user)
}
