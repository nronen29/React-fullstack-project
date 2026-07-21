import { ApiError } from '../utils/ApiError.js'
import { logger } from '../utils/logger.js'

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

// Central error handler. Must have 4 args for Express to treat it as such.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode ?? 500
  let message = err.message ?? 'Internal server error'

  // Prisma unique-constraint violation -> 409.
  if (err.code === 'P2002') {
    statusCode = 409
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field'
    message = `A record with this ${target} already exists`
  } else if (err.code === 'P2025') {
    statusCode = 404
    message = 'Resource not found'
  }

  if (statusCode >= 500) {
    logger.error(message, { stack: err.stack })
  } else {
    logger.warn(`${statusCode} ${message}`)
  }

  res.status(statusCode).json({
    error: { message, ...(err.details ? { details: err.details } : {}) },
  })
}
