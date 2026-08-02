import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { ApiError } from '../utils/ApiError.js'

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, username: user.username },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN },
  )
}

// Verifies the Bearer token and attaches req.user = { id, role, username }.
export function authJwt(req, _res, next) {
  const header = req.headers.authorization ?? ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'))
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET)
    req.user = { id: payload.sub, role: payload.role, username: payload.username }
    return next()
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'))
  }
}

// Restricts a route to one or more roles. Use after authJwt.
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized())
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${roles.join(' or ')}`))
    }
    return next()
  }
}
