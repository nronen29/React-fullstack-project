import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

export const isGraderEnabled = () => Boolean(config.AI_GRADER_URL)

const graderUrl = (path) => `${config.AI_GRADER_URL.replace(/\/$/, '')}${path}`

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

const serviceHeaders = () => ({
  'Content-Type': 'application/json',
  ...(config.AI_GRADER_KEY ? { 'X-Service-Key': config.AI_GRADER_KEY } : {}),
})

// One /grade attempt. `retryable` tells the caller whether a second, more
// patient attempt could plausibly succeed — a rejected service key never will.
async function attemptGrade(payload, timeoutMs) {
  try {
    const res = await fetchWithTimeout(
      graderUrl('/grade'),
      { method: 'POST', headers: serviceHeaders(), body: JSON.stringify(payload) },
      timeoutMs,
    )
    if (!res.ok) {
      return { ok: false, retryable: res.status >= 500, reason: `HTTP ${res.status}` }
    }
    return { ok: true, data: await res.json() }
  } catch (err) {
    return { ok: false, retryable: true, reason: err?.message ?? 'request failed' }
  }
}

// Calls the AI grading microservice for one open-ended answer.
// Returns null on any failure so callers can fall back to local grading.
export async function gradeOpenAnswer({ questionText, expectedAnswer, studentAnswer, maxPoints }) {
  if (!config.AI_GRADER_URL) return null

  const payload = { questionText, expectedAnswer, studentAnswer, maxPoints }

  const first = await attemptGrade(payload, config.AI_GRADER_TIMEOUT_MS)
  if (first.ok) return first.data

  if (!first.retryable) {
    logger.warn(`AI grader rejected the request (${first.reason}); falling back to local grading`)
    return null
  }

  logger.warn(
    `AI grader did not answer within ${config.AI_GRADER_TIMEOUT_MS}ms (${first.reason}); ` +
      `retrying with a ${config.AI_GRADER_RETRY_TIMEOUT_MS}ms budget in case it is waking up`,
  )

  const second = await attemptGrade(payload, config.AI_GRADER_RETRY_TIMEOUT_MS)
  if (second.ok) return second.data

  logger.warn(`AI grader unavailable after retry (${second.reason}); falling back to local grading`)
  return null
}

// Fire-and-forget startup ping so a sleeping grader wakes up before the first
// submission arrives, instead of costing a student their real score.
export async function warmUpGrader() {
  if (!config.AI_GRADER_URL || !config.AI_GRADER_WARMUP) return

  try {
    const res = await fetchWithTimeout(
      graderUrl('/health'),
      { method: 'GET' },
      config.AI_GRADER_RETRY_TIMEOUT_MS,
    )
    if (!res.ok) {
      logger.warn(`AI grader warm-up got HTTP ${res.status}`)
      return
    }
    const health = await res.json()
    logger.info(`AI grader is awake (mode: ${health?.mode ?? 'unknown'})`)
  } catch (err) {
    logger.warn(`AI grader warm-up failed (${err?.message}); grading will retry on demand`)
  }
}
