import bcrypt from 'bcryptjs'
import { prisma } from '../models/prismaClient.js'
import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'
import { nextUserId } from '../utils/ids.js'

export function toPublicUser(user) {
  if (!user) return null
  // Never expose the password hash.
  const { password, ...pub } = user
  return pub
}

export async function registerStudent({ username, password, fullName, email }) {
  const normalizedUsername = username.trim().toLowerCase()
  const normalizedEmail = email.trim().toLowerCase()

  const clash = await prisma.user.findFirst({
    where: { OR: [{ username: normalizedUsername }, { email: normalizedEmail }] },
  })
  if (clash) {
    if (clash.username === normalizedUsername) throw ApiError.conflict('Username is already taken')
    throw ApiError.conflict('Email is already registered')
  }

  const existingIds = (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id)
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      id: nextUserId('student', existingIds),
      username: normalizedUsername,
      password: passwordHash,
      role: 'student',
      fullName: fullName.trim(),
      email: normalizedEmail,
    },
  })

  return toPublicUser(user)
}

export async function authenticate(username, password) {
  const normalized = username.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { username: normalized } })
  if (!user) throw ApiError.unauthorized('Invalid username or password')

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) throw ApiError.unauthorized('Invalid username or password')

  return toPublicUser(user)
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } })
  return toPublicUser(user)
}
