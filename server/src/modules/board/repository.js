import { prisma } from '../../config/database.js'

export class BoardRepository {
  async updatePosition(id, data) {
    return prisma.boardObject.update({
      where: { id },
      data: {
        x: data.x,
        y: data.y,
      },
    })
  }
}
