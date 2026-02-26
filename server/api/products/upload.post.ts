import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { requireAdmin } from '~~/server/utils/session'

const extFromMime = (mime?: string) => {
  if (!mime) return 'bin'
  if (mime.includes('png')) return 'png'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  return 'bin'
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const files = await readMultipartFormData(event)

  const imagePart = files?.find((part) => part.name === 'image' && part.data)
  if (!imagePart?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Image file is required' })
  }

  const mimeType = imagePart.type || 'application/octet-stream'

  if (process.env.VERCEL) {
    const base64 = imagePart.data.toString('base64')
    return {
      imageUrl: `data:${mimeType};base64,${base64}`
    }
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const extension = extFromMime(imagePart.type)
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`
  const absolutePath = join(uploadDir, fileName)

  try {
    await writeFile(absolutePath, imagePart.data)
  }
  catch {
    const base64 = imagePart.data.toString('base64')
    return {
      imageUrl: `data:${mimeType};base64,${base64}`
    }
  }

  return {
    imageUrl: `/uploads/${fileName}`
  }
})
