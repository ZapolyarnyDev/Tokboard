import { prisma } from '../../config/database.js'

export class BoardRepository {
  async findObjectById(id) {
    return prisma.boardObject.findUnique({
      where: { id },
    })
  }

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
