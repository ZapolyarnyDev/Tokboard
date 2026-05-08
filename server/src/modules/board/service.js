export class BoardService {
  constructor(boardRepository) {
    this.repo = boardRepository
  }

  async moveObject(payload) {
    const exists = await this.repo.findObjectById(payload.id)
    if (!exists) {
      const err = new Error('Object not found')
      err.statusCode = 404
      throw err
    }

    return this.repo.updatePosition(payload.id, payload)
  }
}
