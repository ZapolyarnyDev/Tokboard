import { WebSocket } from 'ws'

export class BoardGateway {
  constructor(boardService) {
    this.boardService = boardService
    this.boards = new Map()
  }

  handleConnection(ws) {
    ws.on('message', async (msg) => {
      let data
      try {
        data = JSON.parse(msg)
      } catch {
        return
      }

      switch (data.type) {
        case 'join-board':
          this.joinBoard(ws, data.boardId)
          break

        case 'move-object':
          if (!ws.boardId) return
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
    const updated = await this.boardService.moveObject(data.payload)

    this.broadcast(ws.boardId, {
      type: 'object-moved',
      payload: updated,
    })
  }
}
