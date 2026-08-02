import { ApiError } from '../utils/ApiError.js'

// Validates req[source] against a zod schema and replaces it with parsed data.
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      const message = details.map((d) => (d.path ? `${d.path}: ${d.message}` : d.message)).join('; ')
      return next(ApiError.badRequest(message || 'Validation failed', details))
    }
    req[source] = result.data
    return next()
  }
}
