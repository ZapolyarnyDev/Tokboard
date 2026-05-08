import { WebSocket } from 'ws'
import { verifyAccessToken } from '../auth/jwt.js'
import { validateMovePayload } from '../../utils/validation.js'

export class BoardGateway {
  constructor(boardService) {
    this.boardService = boardService
    this.boards = new Map()
    this.rateLimits = new Map()
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

        case 'join-board':
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          this.joinBoard(ws, data.boardId)
          break

        case 'move-object':
          if (process.env.WS_REQUIRE_AUTH === 'true' && !ws.user) return
          if (!ws.boardId) return

          const userId = ws.user?.sub || 'anonymous'
          if (!this.checkRateLimit(userId)) return

          await this.handleMove(ws, data)
          break
      }
    })

    ws.on('close', () => this.disconnect(ws))
  }

  joinBoard(ws, boardId) {
    if (!boardId) return

    if (ws.boardId && ws.boardId !== boardId) {
      this.boards.get(ws.boardId)?.delete(ws)
    }

    if (!this.boards.has(boardId)) {
      this.boards.set(boardId, new Set())
    }

    this.boards.get(boardId).add(ws)
    ws.boardId = boardId
  }

  disconnect(ws) {
    const boardId = ws.boardId
    if (!boardId) return

    const clients = this.boards.get(boardId)
    clients?.delete(ws)
    if (clients?.size === 0) this.boards.delete(boardId)
  }

  broadcast(boardId, event) {
    const clients = this.boards.get(boardId)
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

    if (clients.size === 0) this.boards.delete(boardId)
  }

  async handleMove(ws, data) {
    if (!validateMovePayload(data.payload)) {
      return
    }

    const updated = await this.boardService.moveObject(data.payload)

    this.broadcast(ws.boardId, {
      type: 'object-moved',
      payload: updated,
    })
  }
}
