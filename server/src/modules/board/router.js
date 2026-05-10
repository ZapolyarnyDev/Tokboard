import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import express from 'express'

import { requireAuth } from '../../middlewares/auth.js'
import { BoardRepository } from './repository.js'
import { BoardService } from './service.js'

const router = express.Router()
const boardService = new BoardService(new BoardRepository())

const uploadRoot = path.resolve('uploads', 'board-images')
const maxImageBytes = Number(process.env.BOARD_IMAGE_MAX_BYTES ?? 5 * 1024 * 1024)

const imageTypes = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const boards = await boardService.listUserBoards(req.user.sub)
    return res.status(200).json({ boards })
  } catch (e) {
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Failed to load boards' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const board = await boardService.createBoardForUser({
      title: req.body?.title,
      userId: req.user.sub,
    })
    return res.status(201).json({ board })
  } catch (e) {
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Failed to create board' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const board = await boardService.getBoardForJoin(req.params.id)
    return res.status(200).json({ board })
  } catch (e) {
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Failed to load board' })
  }
})

function parseImageBody(body) {
  const rawData = body?.dataUrl ?? body?.base64
  if (!rawData || typeof rawData !== 'string') return null

  if (body.dataUrl) {
    const match = rawData.match(/^data:(image\/(?:gif|jpeg|png|webp));base64,(.+)$/)
    if (!match) return null

    return {
      contentType: match[1],
      base64: match[2],
    }
  }

  const contentType = body?.contentType
  if (!imageTypes[contentType]) return null

  return {
    contentType,
    base64: rawData,
  }
}

router.post('/uploads/images', requireAuth, async (req, res) => {
  const parsed = parseImageBody(req.body)
  if (!parsed) {
    return res.status(400).json({
      message: 'Expected image dataUrl or base64 with a supported contentType',
    })
  }

  let buffer
  try {
    buffer = Buffer.from(parsed.base64, 'base64')
  } catch {
    return res.status(400).json({ message: 'Invalid base64 image data' })
  }

  if (!buffer.length || buffer.length > maxImageBytes) {
    return res.status(413).json({ message: 'Image is empty or too large' })
  }

  const ext = imageTypes[parsed.contentType]
  const fileName = `${crypto.randomUUID()}.${ext}`
  await fs.mkdir(uploadRoot, { recursive: true })
  await fs.writeFile(path.join(uploadRoot, fileName), buffer)

  return res.status(201).json({
    imageUrl: `/uploads/board-images/${fileName}`,
    contentType: parsed.contentType,
    size: buffer.length,
  })
})

export { router as boardRouter }
