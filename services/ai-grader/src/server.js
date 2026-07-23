import { createApp } from './app.js'
import { config, usingLlm } from './config.js'

createApp().listen(config.PORT, () => {
  console.log(
    `[ai-grader] listening on port ${config.PORT} (${config.NODE_ENV}) — mode: ${usingLlm ? 'LLM' : 'heuristic'}`,
  )
})
