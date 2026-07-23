import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

export const isGraderEnabled = () => Boolean(config.AI_GRADER_URL)

// Calls the AI grading microservice for one open-ended answer.
// Returns null on any failure so callers can fall back to local grading.
export async function gradeOpenAnswer({ questionText, expectedAnswer, studentAnswer, maxPoints }) {
  if (!config.AI_GRADER_URL) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.AI_GRADER_TIMEOUT_MS)

  try {
    const res = await fetch(`${config.AI_GRADER_URL.replace(/\/$/, '')}/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.AI_GRADER_KEY ? { 'X-Service-Key': config.AI_GRADER_KEY } : {}),
      },
      body: JSON.stringify({ questionText, expectedAnswer, studentAnswer, maxPoints }),
      signal: controller.signal,
    })
    if (!res.ok) {
      logger.warn(`AI grader responded ${res.status}; falling back to local grading`)
      return null
    }
    return await res.json()
  } catch (err) {
    logger.warn(`AI grader unreachable (${err?.message}); falling back to local grading`)
    return null
  } finally {
    clearTimeout(timeout)
  }
}
