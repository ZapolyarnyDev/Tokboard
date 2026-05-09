import { prisma } from '../../config/database.js'

export class BoardRepository {
  findBoardById(id) {
    return prisma.board.findUnique({
      where: { id },
    })
  }

  findBoardByTitle(title) {
    return prisma.board.findFirst({
      where: { title },
      orderBy: { id: 'asc' },
    })
  }

  createBoard(data) {
    return prisma.board.create({
      data,
    })
  }

  async findObjectById(id) {
    return prisma.boardObject.findUnique({
      where: { id },
      include: {
        textData: true,
        imageData: true,
        shapeData: true,
      },
    })
  }

  listObjectsByBoardId(boardId) {
    return prisma.boardObject.findMany({
      where: { boardId },
      orderBy: { createdAt: 'asc' },
      include: {
        textData: true,
        imageData: true,
        shapeData: true,
      },
    })
  }

  createObject(boardId, data) {
    return prisma.boardObject.create({
      data: {
        boardId,
        type: data.type,
        x: data.x,
        y: data.y,
        width: data.width ?? null,
        height: data.height ?? null,
        rotation: data.rotation ?? 0,
        textData: data.textData
          ? {
              create: {
                text: data.textData.text,
                fontSize: data.textData.fontSize ?? null,
                fontColor: data.textData.fontColor ?? null,
              },
            }
          : undefined,
        imageData: data.imageData
          ? {
              create: {
                imageUrl: data.imageData.imageUrl,
              },
            }
          : undefined,
        shapeData: data.shapeData
          ? {
              create: {
                kind: data.shapeData.kind,
                strokeColor: data.shapeData.strokeColor ?? null,
                fillColor: data.shapeData.fillColor ?? null,
                strokeWidth: data.shapeData.strokeWidth ?? null,
                points: data.shapeData.points ?? null,
              },
            }
          : undefined,
      },
      include: {
        textData: true,
        imageData: true,
        shapeData: true,
      },
    })
  }

  updateObject(id, data) {
    return prisma.boardObject.update({
      where: { id },
      data: {
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        rotation: data.rotation,
        textData: data.textData
          ? {
              upsert: {
                create: {
                  text: data.textData.text,
                  fontSize: data.textData.fontSize ?? null,
                  fontColor: data.textData.fontColor ?? null,
                },
                update: {
                  text: data.textData.text,
                  fontSize: data.textData.fontSize ?? null,
                  fontColor: data.textData.fontColor ?? null,
                },
              },
            }
          : undefined,
        imageData: data.imageData
          ? {
              upsert: {
                create: { imageUrl: data.imageData.imageUrl },
                update: { imageUrl: data.imageData.imageUrl },
              },
            }
          : undefined,
        shapeData: data.shapeData
          ? {
              upsert: {
                create: {
                  kind: data.shapeData.kind,
                  strokeColor: data.shapeData.strokeColor ?? null,
                  fillColor: data.shapeData.fillColor ?? null,
                  strokeWidth: data.shapeData.strokeWidth ?? null,
                  points: data.shapeData.points ?? null,
                },
                update: {
                  kind: data.shapeData.kind,
                  strokeColor: data.shapeData.strokeColor ?? null,
                  fillColor: data.shapeData.fillColor ?? null,
                  strokeWidth: data.shapeData.strokeWidth ?? null,
                  points: data.shapeData.points ?? null,
                },
              },
            }
          : undefined,
      },
      include: {
        textData: true,
        imageData: true,
        shapeData: true,
      },
    })
  }

  deleteObject(id) {
    return prisma.boardObject.delete({
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
