import dotenv from 'dotenv'

dotenv.config()

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 4100),

  // Shared secret the main API must send in the X-Service-Key header.
  // If empty, auth is skipped (convenient for local dev).
  SERVICE_KEY: process.env.SERVICE_KEY ?? '',

  // Optional LLM provider (OpenAI-compatible Chat Completions API).
  // Leave AI_API_KEY empty to use the built-in heuristic grader.
  AI_API_KEY: process.env.AI_API_KEY ?? '',
  AI_BASE_URL: process.env.AI_BASE_URL ?? 'https://api.openai.com/v1',
  AI_MODEL: process.env.AI_MODEL ?? 'gpt-4o-mini',
  AI_TIMEOUT_MS: Number(process.env.AI_TIMEOUT_MS ?? 12000),
}

export const usingLlm = Boolean(config.AI_API_KEY)
