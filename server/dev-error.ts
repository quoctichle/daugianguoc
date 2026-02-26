import type { H3Error, H3Event } from 'h3'
import { send } from 'h3'

export default defineNitroErrorHandler((error: H3Error, event: H3Event) => {
  const statusCode = error.statusCode || 500
  const statusMessage = error.statusMessage || error.message || 'Internal Server Error'

  console.error('[nitro-dev-error]', {
    statusCode,
    statusMessage,
    stack: error.stack
  })

  if (!event.node.res.headersSent) {
    event.node.res.statusCode = statusCode
    event.node.res.setHeader('content-type', 'application/json; charset=utf-8')
  }

  return send(event, JSON.stringify({
    statusCode,
    statusMessage,
    message: error.message || statusMessage
  }))
})
