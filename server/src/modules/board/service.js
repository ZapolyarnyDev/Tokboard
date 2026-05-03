export class BoardService {
  constructor(boardRepository) {
    this.repo = boardRepository
  }

  async moveObject(payload) {
    return this.repo.updatePosition(payload.id, payload)
  }
}
