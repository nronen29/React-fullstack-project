import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../middleware/auth.js'
import { registerStudent, authenticate, getUserById } from '../services/authService.js'
import { ApiError } from '../utils/ApiError.js'

export const register = asyncHandler(async (req, res) => {
  const user = await registerStudent(req.body)
  const token = signToken(user)
  res.status(201).json({ token, user })
})

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body
  const user = await authenticate(username, password)
  const token = signToken(user)
  res.json({ token, user })
})

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id)
  if (!user) throw ApiError.unauthorized('User no longer exists')
  res.json({ user })
})
