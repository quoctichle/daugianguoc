import { finalizeAuction } from '~~/server/utils/auction'
import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/session'
import { sendWinnerNotificationEmail } from '~~/server/utils/mailer'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing auction id' })
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true }
  })

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const winners = await finalizeAuction(id)

  const emailJobs = winners.map(async (winner) => {
    try {
      const sent = await sendWinnerNotificationEmail(
        {
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpUser: config.smtpUser,
          smtpPass: config.smtpPass,
          mailFrom: config.mailFrom,
          smtpAllowSelfSigned: config.smtpAllowSelfSigned
        },
        {
          to: winner.user.email,
          winnerName: winner.user.name,
          productName: product.name,
          rank: winner.rank,
          amount: winner.amount
        }
      )

      return {
        winnerId: winner.id,
        email: winner.user.email,
        sent,
        reason: sent ? null : 'Unknown send failure'
      }
    }
    catch (error: any) {
      const reason = error?.message || 'Email send failed'
      console.error('Failed to send winner email', {
        winnerId: winner.id,
        email: winner.user.email,
        message: reason
      })

      return {
        winnerId: winner.id,
        email: winner.user.email,
        sent: false,
        reason
      }
    }
  })

  const emailResults = await Promise.all(emailJobs)
  const sentCount = emailResults.filter(item => item.sent).length
  const failedCount = emailResults.length - sentCount

  return {
    winners,
    emailResults,
    emailSummary: {
      total: emailResults.length,
      sent: sentCount,
      failed: failedCount
    }
  }
})
