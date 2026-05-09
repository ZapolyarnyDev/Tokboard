export class BoardService {
  constructor(boardRepository) {
    this.repo = boardRepository
  }

  async listBoardObjects(boardId) {
    const board = await this.repo.findBoardById(boardId)
    if (!board) {
      const err = new Error('Board not found')
      err.statusCode = 404
      throw err
    }
    return this.repo.listObjectsByBoardId(boardId)
  }

  async ensureBoardFromJoin({ boardIdRaw, userId }) {
    const asNumber =
      typeof boardIdRaw === 'number'
        ? boardIdRaw
        : typeof boardIdRaw === 'string'
          ? Number(boardIdRaw)
          : NaN

    if (Number.isInteger(asNumber) && asNumber > 0) {
      const board = await this.repo.findBoardById(asNumber)
      if (!board) {
        const err = new Error('Board not found')
        err.statusCode = 404
        throw err
      }
      return { boardId: board.id, boardKey: String(board.id) }
    }

    if (typeof boardIdRaw !== 'string' || !boardIdRaw.trim()) {
      const err = new Error('Invalid boardId')
      err.statusCode = 400
      throw err
    }

    const title = boardIdRaw.trim()
    const existing = await this.repo.findBoardByTitle(title)
    if (existing) return { boardId: existing.id, boardKey: String(existing.id) }

    if (!userId) {
      const err = new Error('Board not found')
      err.statusCode = 404
      throw err
    }

    const created = await this.repo.createBoard({
      title,
      ownerId: Number(userId),
    })
    return { boardId: created.id, boardKey: String(created.id) }
  }

  normalizeIncomingObject(payload) {
    if (!payload || typeof payload !== 'object') {
      const err = new Error('Invalid payload')
      err.statusCode = 400
      throw err
    }

    const finite = (v) => typeof v === 'number' && Number.isFinite(v)
    const str = (v) => (typeof v === 'string' ? v : null)

    const base = {
      x: finite(payload.x) ? payload.x : 0,
      y: finite(payload.y) ? payload.y : 0,
      width: finite(payload.width) ? payload.width : undefined,
      height: finite(payload.height) ? payload.height : undefined,
      rotation: finite(payload.rotation) ? payload.rotation : 0,
    }

    const t = payload.type

    if (t === 'TEXT' || t === 'IMAGE' || t === 'SHAPE') {
      return {
        type: t,
        ...base,
        textData: payload.textData ?? undefined,
        imageData: payload.imageData ?? undefined,
        shapeData: payload.shapeData ?? undefined,
      }
    }

    if (t === 'text') {
      return {
        type: 'TEXT',
        ...base,
        textData: {
          text: str(payload.text) ?? '',
          fontSize: finite(payload.fontSize) ? payload.fontSize : undefined,
          fontColor: str(payload.color) ?? str(payload.fontColor) ?? undefined,
        },
      }
    }

    if (t === 'image') {
      return {
        type: 'IMAGE',
        ...base,
        imageData: {
          imageUrl: str(payload.src) ?? str(payload.imageUrl) ?? '',
        },
      }
    }

    const shapeKindMap = {
      line: 'LINE',
      rect: 'RECTANGLE',
      rectangle: 'RECTANGLE',
      triangle: 'TRIANGLE',
      circle: 'CIRCLE',
    }

    if (typeof t === 'string' && shapeKindMap[t]) {
      return {
        type: 'SHAPE',
        ...base,
        shapeData: {
          kind: shapeKindMap[t],
          strokeColor:
            str(payload.stroke) ?? str(payload.strokeColor) ?? undefined,
          fillColor: str(payload.fill) ?? str(payload.fillColor) ?? undefined,
          strokeWidth: finite(payload.strokeWidth)
            ? payload.strokeWidth
            : undefined,
          points: payload.points ?? undefined,
        },
      }
    }

    const err = new Error('Unsupported object type')
    err.statusCode = 400
    throw err
  }

  toClientObject(record) {
    if (!record) return null

    if (record.type === 'TEXT') {
      return {
        id: record.id,
        type: 'text',
        x: record.x,
        y: record.y,
        width: record.width,
        height: record.height,
        rotation: record.rotation,
        text: record.textData?.text ?? '',
        fontSize: record.textData?.fontSize ?? undefined,
        color: record.textData?.fontColor ?? undefined,
      }
    }

    if (record.type === 'IMAGE') {
      return {
        id: record.id,
        type: 'image',
        x: record.x,
        y: record.y,
        width: record.width,
        height: record.height,
        rotation: record.rotation,
        src: record.imageData?.imageUrl ?? '',
      }
    }

    const kindToType = {
      LINE: 'line',
      RECTANGLE: 'rect',
      TRIANGLE: 'triangle',
      CIRCLE: 'circle',
      POLYGON: 'polygon',
    }

    return {
      id: record.id,
      type: kindToType[record.shapeData?.kind] ?? 'shape',
      x: record.x,
      y: record.y,
      width: record.width,
      height: record.height,
      rotation: record.rotation,
      stroke: record.shapeData?.strokeColor ?? undefined,
      fill: record.shapeData?.fillColor ?? undefined,
      strokeWidth: record.shapeData?.strokeWidth ?? undefined,
      points: record.shapeData?.points ?? undefined,
    }
  }

  async createObject(boardId, payload) {
    const normalized = this.normalizeIncomingObject(payload)
    const board = await this.repo.findBoardById(boardId)
    if (!board) {
      const err = new Error('Board not found')
      err.statusCode = 404
      throw err
    }
    const created = await this.repo.createObject(boardId, normalized)
    return this.toClientObject(created)
  }

  async updateObject(boardId, objectId, payload) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Object not found')
      err.statusCode = 404
      throw err
    }

    const normalized = this.normalizeIncomingObject({
      ...this.toClientObject(existing),
      ...payload,
    })

    const updated = await this.repo.updateObject(objectId, {
      x: normalized.x,
      y: normalized.y,
      width: normalized.width ?? null,
      height: normalized.height ?? null,
      rotation: normalized.rotation ?? 0,
      textData: normalized.textData ?? undefined,
      imageData: normalized.imageData ?? undefined,
      shapeData: normalized.shapeData ?? undefined,
    })

    return this.toClientObject(updated)
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

  async moveObjectOnBoard(boardId, objectId, payload) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Object not found')
      err.statusCode = 404
      throw err
    }

    const finite = (v) => typeof v === 'number' && Number.isFinite(v)
    const x = finite(payload.x) ? payload.x : existing.x
    const y = finite(payload.y) ? payload.y : existing.y

    const updated = await this.repo.updateObject(objectId, {
      x,
      y,
      width: existing.width,
      height: existing.height,
      rotation: existing.rotation,
      textData: existing.textData
        ? {
            text: existing.textData.text,
            fontSize: existing.textData.fontSize,
            fontColor: existing.textData.fontColor,
          }
        : undefined,
      imageData: existing.imageData
        ? {
            imageUrl: existing.imageData.imageUrl,
          }
        : undefined,
      shapeData: existing.shapeData
        ? {
            kind: existing.shapeData.kind,
            strokeColor: existing.shapeData.strokeColor,
            fillColor: existing.shapeData.fillColor,
            strokeWidth: existing.shapeData.strokeWidth,
            points: existing.shapeData.points,
          }
        : undefined,
    })

    return this.toClientObject(updated)
  }

  async deleteObject(boardId, objectId) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Object not found')
      err.statusCode = 404
      throw err
    }
    await this.repo.deleteObject(objectId)
    return { id: objectId }
  }
}
