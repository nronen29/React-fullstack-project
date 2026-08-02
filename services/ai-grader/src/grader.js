import { usingLlm } from './config.js'
import { gradeHeuristic } from './heuristic.js'
import { gradeWithLlm } from './llm.js'

// Grades one open-ended answer. Uses the LLM when configured, otherwise the
// heuristic. Always falls back to the heuristic if the LLM call fails.
export async function grade(payload) {
  if (usingLlm) {
    const llmResult = await gradeWithLlm(payload)
    if (llmResult) return llmResult
  }
  return { ...gradeHeuristic(payload), provider: 'heuristic' }
}
