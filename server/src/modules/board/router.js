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
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Не удалось загрузить доски' })
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
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Не удалось создать доску' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const board = await boardService.getBoardForJoin(req.params.id)
    return res.status(200).json({ board })
  } catch (e) {
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Не удалось загрузить доску' })
  }
})

router.delete('/:boardId/objects/:objectId', requireAuth, async (req, res) => {
  try {
    const boardId = Number(req.params.boardId)
    const objectId = Number(req.params.objectId)

    if (!Number.isInteger(boardId) || boardId <= 0 || !Number.isInteger(objectId) || objectId <= 0) {
      return res.status(400).json({ message: 'Некорректный ID доски или объекта' })
    }

    const result = await boardService.deleteObject(boardId, objectId)
    return res.status(200).json(result)
  } catch (e) {
    return res.status(e.statusCode ?? 500).json({ message: e.message ?? 'Не удалось удалить объект' })
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
      message: 'Ожидается dataUrl изображения или base64 с поддерживаемым contentType',
    })
  }

  let buffer
  try {
    buffer = Buffer.from(parsed.base64, 'base64')
  } catch {
    return res.status(400).json({ message: 'Некорректные base64-данные изображения' })
  }

  if (!buffer.length || buffer.length > maxImageBytes) {
    return res.status(413).json({ message: 'Изображение пустое или слишком большое' })
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
