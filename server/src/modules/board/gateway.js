import { WebSocket } from 'ws'

import {
  validateCreateObjectPayload,
  validateDeleteObjectPayload,
  validateMoveObjectPayload,
  validateUpdateObjectPayload,
} from '../../utils/validation.js'
import { verifyAccessToken } from '../auth/jwt.js'

export class BoardGateway {
  constructor(boardService) {
    this.boardService = boardService
    this.boards = new Map() // boardKey -> Set<WebSocket>
    this.rateLimits = new Map() // userId -> {count, resetAt}
  }

  checkRateLimit(userId) {
    const now = Date.now()
    const limit = this.rateLimits.get(userId)

    if (!limit || now > limit.resetAt) {
      this.rateLimits.set(userId, {
        count: 1,
        resetAt: now + 1000,
      })
      return true
    }

    if (limit.count >= 10) {
      return false
    }

    limit.count++
    return true
  }

  handleConnection(ws) {
    ws.user = null
    ws.boardKey = null
    ws.boardId = null

    ws.on('message', async (msg) => {
      let data
      try {
        data = JSON.parse(msg)
      } catch {
        return
      }

      switch (data.type) {
        case 'auth': {
          const token = data.accessToken
          if (!token) return
          try {
            ws.user = verifyAccessToken(token)
          } catch {
            ws.user = null
          }
          break
        }

        case 'join-board': {
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          await this.joinBoard(ws, data.boardId)
          break
        }

        case 'create-object': {
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          if (!ws.boardKey) return

          const userId = ws.user?.sub || 'anonymous'
          if (!this.checkRateLimit(userId)) return

          await this.handleCreate(ws, data)
          break
        }

        case 'update-object': {
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          if (!ws.boardKey) return

          const userId = ws.user?.sub || 'anonymous'
          if (!this.checkRateLimit(userId)) return

          await this.handleUpdate(ws, data)
          break
        }

        case 'move-object': {
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          if (!ws.boardKey) return

          const userId = ws.user?.sub || 'anonymous'
          if (!this.checkRateLimit(userId)) return

          await this.handleMove(ws, data)
          break
        }

        case 'delete-object': {
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          if (!ws.boardKey) return

          const userId = ws.user?.sub || 'anonymous'
          if (!this.checkRateLimit(userId)) return

          await this.handleDelete(ws, data)
          break
        }
      }
    })

    ws.on('close', () => this.disconnect(ws))
  }

  async joinBoard(ws, boardId) {
    if (!boardId) return

    let resolved
    try {
      resolved = await this.boardService.ensureBoardFromJoin({
        boardIdRaw: boardId,
        userId: ws.user?.sub,
      })
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: {
          message: e.message ?? 'Не удалось подключиться к доске',
        },
      })
      return
    }

    if (ws.boardKey && ws.boardKey !== resolved.boardKey) {
      this.boards.get(ws.boardKey)?.delete(ws)
    }

    if (!this.boards.has(resolved.boardKey)) {
      this.boards.set(resolved.boardKey, new Set())
    }

    this.boards.get(resolved.boardKey).add(ws)
    ws.boardKey = resolved.boardKey
    ws.boardId = resolved.boardId

    try {
      const objects = await this.boardService.listBoardObjects(ws.boardId)
      this.send(ws, {
        type: 'board-state',
        payload: {
          objects: objects.map((o) => this.boardService.toClientObject(o)),
        },
      })
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: {
          message: e.message ?? 'Не удалось загрузить доску',
        },
      })
    }
  }

  disconnect(ws) {
    const boardKey = ws.boardKey
    if (!boardKey) return

    const clients = this.boards.get(boardKey)
    clients?.delete(ws)
    if (clients?.size === 0) this.boards.delete(boardKey)
  }

  send(ws, event) {
    try {
      ws.send(JSON.stringify(event))
    } catch {
      // ignore
    }
  }

  broadcast(boardKey, event) {
    const clients = this.boards.get(boardKey)
    if (!clients) return

    for (const client of clients) {
      if (client.readyState !== WebSocket.OPEN) {
        clients.delete(client)
        continue
      }

      try {
        client.send(JSON.stringify(event))
      } catch {
        clients.delete(client)
      }
    }

    if (clients.size === 0) this.boards.delete(boardKey)
  }

  broadcastBoardObjectEvent(boardKey, type, payload) {
    this.broadcast(boardKey, {
      type,
      payload,
    })
  }

  async handleCreate(ws, data) {
    if (!validateCreateObjectPayload(data.payload)) return

    try {
      const created = await this.boardService.createObject(ws.boardId, data.payload)
      this.broadcastBoardObjectEvent(ws.boardKey, 'create-object', created)
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: { message: e.message ?? 'Не удалось создать объект' },
      })
    }
  }

  async handleUpdate(ws, data) {
    if (!validateUpdateObjectPayload(data.payload)) return
    const objectId = data.payload?.id
    if (!objectId) return

    try {
      const updated = await this.boardService.updateObject(
        ws.boardId,
        objectId,
        data.payload,
      )
      this.broadcastBoardObjectEvent(ws.boardKey, 'update-object', updated)
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: { message: e.message ?? 'Не удалось обновить объект' },
      })
    }
  }

  async handleMove(ws, data) {
    if (!validateMoveObjectPayload(data.payload)) return
    const objectId = data.payload?.id
    if (!objectId) return

    try {
      const moved = await this.boardService.moveObjectOnBoard(
        ws.boardId,
        objectId,
        data.payload,
      )
      this.broadcastBoardObjectEvent(ws.boardKey, 'move-object', moved)
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: { message: e.message ?? 'Не удалось переместить объект' },
      })
    }
  }

  async handleDelete(ws, data) {
    if (!validateDeleteObjectPayload(data.payload)) return
    const objectId = data.payload?.id
    if (!objectId) return

    try {
      const deleted = await this.boardService.deleteObject(ws.boardId, objectId)
      this.broadcastBoardObjectEvent(ws.boardKey, 'delete-object', deleted)
    } catch (e) {
      this.send(ws, {
        type: 'error',
        payload: { message: e.message ?? 'Не удалось удалить объект' },
      })
    }
  }
}
