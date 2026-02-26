import nodemailer from 'nodemailer'

type MailerConfig = {
  smtpHost?: string
  smtpPort?: string | number
  smtpUser?: string
  smtpPass?: string
  mailFrom?: string
  smtpAllowSelfSigned?: string | boolean
}

const toBoolean = (value?: string | boolean) => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
  }

  return false
}

const toPort = (portValue?: string | number) => {
  if (!portValue) {
    return 465
  }

  const parsed = typeof portValue === 'number' ? portValue : Number(portValue)
  return Number.isFinite(parsed) ? parsed : 465
}

const hasMailerConfig = (config: MailerConfig) => {
  return Boolean(config.smtpHost && config.smtpUser && config.smtpPass && config.mailFrom)
}

export const sendWinnerNotificationEmail = async (
  config: MailerConfig,
  payload: {
    to: string
    winnerName: string
    productName: string
    rank: number
    amount: number
  }
) => {
  if (!hasMailerConfig(config)) {
    return false
  }

  const port = toPort(config.smtpPort)
  const allowSelfSigned = toBoolean(config.smtpAllowSelfSigned)

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port,
    secure: port === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    },
    tls: allowSelfSigned
      ? {
          rejectUnauthorized: false
        }
      : undefined
  })

  await transporter.sendMail({
    from: config.mailFrom,
    to: payload.to,
    subject: `Chúc mừng bạn đã trúng đấu giá: ${payload.productName}`,
    text: [
      `Xin chào ${payload.winnerName},`,
      '',
      `Chúc mừng bạn đã trúng phiên đấu giá sản phẩm ${payload.productName}.`,
      `Thứ hạng: #${payload.rank}`,
      `Mức giá trúng: ¥ ${payload.amount.toLocaleString('ja-JP')}`,
      '',
      'Vui lòng đăng nhập hệ thống để xem chi tiết kết quả.',
      '',
      'Trân trọng,'
    ].join('\n')
  })

  return true
}
