// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
    adminEmails: process.env.ADMIN_EMAILS,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    mailFrom: process.env.MAIL_FROM,
    smtpAllowSelfSigned: process.env.SMTP_ALLOW_SELF_SIGNED,
    public: {
      appName: 'Dau Gia Nguoc'
    }
  },
  routeRules: {
    '/admin/**': { ssr: true },
    '/': { ssr: true },
    '/login': { ssr: true }
  },
  nitro: {
    devErrorHandler: '~/server/dev-error'
  }
})
