import { config } from './config.js'

// Grades an answer with an OpenAI-compatible Chat Completions endpoint.
// Returns null on any failure so the caller can fall back to the heuristic.
export async function gradeWithLlm({ questionText, expectedAnswer, studentAnswer, maxPoints }) {
  const points = Math.max(1, Number(maxPoints) || 1)

  const system =
    'You are an exam grader. Compare the student answer to the expected answer and ' +
    'grade it on meaning, not exact wording. Respond ONLY with strict JSON: ' +
    '{"score": <integer 0..MAX>, "isCorrect": <boolean>, "feedback": "<one short sentence>"}.'

  const user =
    `MAX=${points}\n` +
    `Question: ${questionText ?? '(not provided)'}\n` +
    `Expected answer: ${expectedAnswer ?? '(not provided)'}\n` +
    `Student answer: ${studentAnswer ?? '(empty)'}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.AI_TIMEOUT_MS)

  try {
    const res = await fetch(`${config.AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.AI_MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    if (!res.ok) return null
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content)
    const score = Math.max(0, Math.min(points, Math.round(Number(parsed.score))))
    if (Number.isNaN(score)) return null

    return {
      score,
      isCorrect: Boolean(parsed.isCorrect),
      feedback: String(parsed.feedback ?? '').slice(0, 500),
      provider: 'llm',
    }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
