export class BoardGateway {
  constructor(boardService) {
    this.boardService = boardService
    this.boards = new Map()
  }

  handleConnection(ws) {
    ws.on('message', async (msg) => {
      const data = JSON.parse(msg)

      switch (data.type) {
        case 'join-board':
          this.joinBoard(ws, data.boardId)
          break

        case 'move-object':
          await this.handleMove(ws, data)
          break
      }
    })

    ws.on('close', () => this.disconnect(ws))
  }

  joinBoard(ws, boardId) {
    if (!this.boards.has(boardId)) {
      this.boards.set(boardId, new Set())
    }

    this.boards.get(boardId).add(ws)
    ws.boardId = boardId
  }

  disconnect(ws) {
    const boardId = ws.boardId
    if (!boardId) return

    this.boards.get(boardId)?.delete(ws)
  }

  broadcast(boardId, event) {
    const clients = this.boards.get(boardId)
    if (!clients) return

    for (const client of clients) {
      client.send(JSON.stringify(event))
    }
  }

  async handleMove(ws, data) {
    const updated = await this.boardService.moveObject(data.payload)

    this.broadcast(ws.boardId, {
      type: 'object-moved',
      payload: updated,
    })
  }
}
