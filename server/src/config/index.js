import dotenv from 'dotenv'

dotenv.config()

function required(name, fallback) {
  const value = process.env[name] ?? fallback
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const NODE_ENV = process.env.NODE_ENV ?? 'development'
const isTest = NODE_ENV === 'test'

export const config = {
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isTest,
  PORT: Number(process.env.PORT ?? 4000),
  // In test mode we allow a missing secret so unit tests can run without env setup.
  JWT_SECRET: isTest ? (process.env.JWT_SECRET ?? 'test-secret') : required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '2h',
  // Comma-separated list of allowed origins, or "*" for any.
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  LOG_LEVEL: process.env.LOG_LEVEL ?? (NODE_ENV === 'production' ? 'info' : 'debug'),
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS ?? 10),

  // AI grading microservice. If AI_GRADER_URL is empty, open questions fall
  // back to local keyword-overlap grading.
  AI_GRADER_URL: process.env.AI_GRADER_URL ?? '',
  AI_GRADER_KEY: process.env.AI_GRADER_KEY ?? '',
  AI_GRADER_TIMEOUT_MS: Number(process.env.AI_GRADER_TIMEOUT_MS ?? 12000),
  // Second attempt budget. On free hosting tiers an idle grader can take ~50s
  // to wake, which is far longer than a healthy request should ever take.
  AI_GRADER_RETRY_TIMEOUT_MS: Number(process.env.AI_GRADER_RETRY_TIMEOUT_MS ?? 60000),
  // Ping the grader at startup so the first real submission hits a warm service.
  AI_GRADER_WARMUP: (process.env.AI_GRADER_WARMUP ?? 'true') !== 'false',
}
