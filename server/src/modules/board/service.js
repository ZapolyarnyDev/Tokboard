export class BoardService {
  constructor(boardRepository) {
    this.repo = boardRepository
  }

  finite(v) {
    return typeof v === 'number' && Number.isFinite(v)
  }

  stringOrNull(v) {
    return typeof v === 'string' ? v : null
  }

  pickNumber(payload, key, fallback) {
    return this.finite(payload?.[key]) ? payload[key] : fallback
  }

  normalizeLinePoints(payload, base) {
    const points =
      payload.points && typeof payload.points === 'object' && !Array.isArray(payload.points)
        ? payload.points
        : {}

    const x1 = this.pickNumber(payload, 'x1', this.pickNumber(points, 'x1', base.x))
    const y1 = this.pickNumber(payload, 'y1', this.pickNumber(points, 'y1', base.y))
    const x2 = this.pickNumber(
      payload,
      'x2',
      this.pickNumber(points, 'x2', base.x + (base.width ?? 0)),
    )
    const y2 = this.pickNumber(
      payload,
      'y2',
      this.pickNumber(points, 'y2', base.y + (base.height ?? 0)),
    )

    return { x1, y1, x2, y2 }
  }

  async listBoardObjects(boardId) {
    const board = await this.repo.findBoardById(boardId)
    if (!board) {
      const err = new Error('Доска не найдена')
      err.statusCode = 404
      throw err
    }
    return this.repo.listObjectsByBoardId(boardId)
  }

  toClientBoard(board) {
    return {
      id: board.id,
      title: board.title,
      ownerId: board.ownerId,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    }
  }

  async listUserBoards(userId) {
    const boards = await this.repo.listBoardsByOwnerId(Number(userId))
    return boards.map((board) => this.toClientBoard(board))
  }

  async createBoardForUser({ title, userId }) {
    const boardTitle =
      typeof title === 'string' && title.trim()
        ? title.trim()
        : `Доска ${new Date().toLocaleString('ru-RU')}`

    const created = await this.repo.createBoard({
      title: boardTitle,
      ownerId: Number(userId),
    })

    return this.toClientBoard(created)
  }

  async getBoardForJoin(boardIdRaw) {
    const boardId = Number(boardIdRaw)
    if (!Number.isInteger(boardId) || boardId <= 0) {
      const err = new Error('Некорректный ID доски')
      err.statusCode = 400
      throw err
    }

    const board = await this.repo.findBoardById(boardId)
    if (!board) {
      const err = new Error('Доска не найдена')
      err.statusCode = 404
      throw err
    }

    return this.toClientBoard(board)
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
        const err = new Error('Доска не найдена')
        err.statusCode = 404
        throw err
      }
      return { boardId: board.id, boardKey: String(board.id) }
    }

    if (typeof boardIdRaw !== 'string' || !boardIdRaw.trim()) {
      const err = new Error('Некорректный ID доски')
      err.statusCode = 400
      throw err
    }

    const title = boardIdRaw.trim()
    const existing = await this.repo.findBoardByTitle(title)
    if (existing) return { boardId: existing.id, boardKey: String(existing.id) }

    if (!userId) {
      const err = new Error('Доска не найдена')
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
      const err = new Error('Некорректные данные')
      err.statusCode = 400
      throw err
    }

    const base = {
      x: this.finite(payload.x) ? payload.x : 0,
      y: this.finite(payload.y) ? payload.y : 0,
      width: this.finite(payload.width) ? payload.width : undefined,
      height: this.finite(payload.height) ? payload.height : undefined,
      rotation: this.finite(payload.rotation) ? payload.rotation : 0,
    }

    const t = payload.type

    if (t === 'TEXT') {
      const textData = payload.textData ?? {}

      return {
        type: t,
        ...base,
        textData: {
          text: this.stringOrNull(textData.text) ?? this.stringOrNull(payload.text) ?? '',
          fontSize: this.finite(textData.fontSize)
            ? textData.fontSize
            : this.finite(payload.fontSize)
              ? payload.fontSize
              : undefined,
          fontColor:
            this.stringOrNull(textData.fontColor) ??
            this.stringOrNull(payload.color) ??
            this.stringOrNull(payload.fontColor) ??
            undefined,
        },
      }
    }

    if (t === 'IMAGE') {
      const imageData = payload.imageData ?? {}

      return {
        type: t,
        ...base,
        imageData: {
          imageUrl:
            this.stringOrNull(imageData.imageUrl) ??
            this.stringOrNull(payload.src) ??
            this.stringOrNull(payload.imageUrl) ??
            '',
        },
      }
    }

    if (t === 'SHAPE') {
      const shapeData = payload.shapeData ?? {}
      const kind = this.stringOrNull(shapeData.kind) ?? this.stringOrNull(payload.kind)
      const supportedKinds = ['LINE', 'RECTANGLE', 'TRIANGLE', 'CIRCLE', 'POLYGON']

      if (!supportedKinds.includes(kind)) {
        const err = new Error('Неподдерживаемый тип фигуры')
        err.statusCode = 400
        throw err
      }

      const points =
        kind === 'LINE'
          ? this.normalizeLinePoints(
              {
                ...payload,
                points: shapeData.points ?? payload.points,
              },
              base,
            )
          : shapeData.points ?? payload.points ?? undefined
      const objectBase =
        kind === 'LINE'
          ? {
              ...base,
              x: Math.min(points.x1, points.x2),
              y: Math.min(points.y1, points.y2),
              width: Math.abs(points.x2 - points.x1),
              height: Math.abs(points.y2 - points.y1),
            }
          : base

      return {
        type: t,
        ...objectBase,
        shapeData: {
          kind,
          strokeColor:
            this.stringOrNull(shapeData.strokeColor) ??
            this.stringOrNull(payload.stroke) ??
            this.stringOrNull(payload.strokeColor) ??
            undefined,
          fillColor:
            this.stringOrNull(shapeData.fillColor) ??
            this.stringOrNull(payload.fill) ??
            this.stringOrNull(payload.fillColor) ??
            undefined,
          strokeWidth: this.finite(shapeData.strokeWidth)
            ? shapeData.strokeWidth
            : this.finite(payload.strokeWidth)
              ? payload.strokeWidth
              : undefined,
          points,
        },
      }
    }

    if (t === 'text') {
      return {
        type: 'TEXT',
        ...base,
        textData: {
          text: this.stringOrNull(payload.text) ?? '',
          fontSize: this.finite(payload.fontSize) ? payload.fontSize : undefined,
          fontColor:
            this.stringOrNull(payload.color) ??
            this.stringOrNull(payload.fontColor) ??
            undefined,
        },
      }
    }

    if (t === 'image') {
      return {
        type: 'IMAGE',
        ...base,
        imageData: {
          imageUrl:
            this.stringOrNull(payload.src) ??
            this.stringOrNull(payload.imageUrl) ??
            '',
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
      const kind = shapeKindMap[t]
      const points =
        kind === 'LINE' ? this.normalizeLinePoints(payload, base) : payload.points ?? undefined
      const objectBase =
        kind === 'LINE'
          ? {
              ...base,
              x: Math.min(points.x1, points.x2),
              y: Math.min(points.y1, points.y2),
              width: Math.abs(points.x2 - points.x1),
              height: Math.abs(points.y2 - points.y1),
            }
          : base

      return {
        type: 'SHAPE',
        ...objectBase,
        shapeData: {
          kind,
          strokeColor:
            this.stringOrNull(payload.stroke) ??
            this.stringOrNull(payload.strokeColor) ??
            undefined,
          fillColor:
            this.stringOrNull(payload.fill) ??
            this.stringOrNull(payload.fillColor) ??
            undefined,
          strokeWidth: this.finite(payload.strokeWidth)
            ? payload.strokeWidth
            : undefined,
          points,
        },
      }
    }

    const err = new Error('Неподдерживаемый тип объекта')
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

    const base = {
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

    if (record.shapeData?.kind !== 'LINE') return base

    const points =
      record.shapeData?.points && typeof record.shapeData.points === 'object'
        ? record.shapeData.points
        : {}

    return {
      ...base,
      x1: this.finite(points.x1) ? points.x1 : record.x,
      y1: this.finite(points.y1) ? points.y1 : record.y,
      x2: this.finite(points.x2) ? points.x2 : record.x + (record.width ?? 0),
      y2: this.finite(points.y2) ? points.y2 : record.y + (record.height ?? 0),
    }
  }

  async createObject(boardId, payload) {
    const normalized = this.normalizeIncomingObject(payload)
    const board = await this.repo.findBoardById(boardId)
    if (!board) {
      const err = new Error('Доска не найдена')
      err.statusCode = 404
      throw err
    }
    const created = await this.repo.createObject(boardId, normalized)
    return this.toClientObject(created)
  }

  async updateObject(boardId, objectId, payload) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Объект не найден')
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

  // Legacy API used by older gateway code; kept for compatibility.
  async moveObject(payload) {
    const exists = await this.repo.findObjectById(payload.id)
    if (!exists) {
      const err = new Error('Объект не найден')
      err.statusCode = 404
      throw err
    }

    return this.repo.updatePosition(payload.id, payload)
  }

  async moveObjectOnBoard(boardId, objectId, payload) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Объект не найден')
      err.statusCode = 404
      throw err
    }

    const finite = (v) => typeof v === 'number' && Number.isFinite(v)
    const x = finite(payload.x) ? payload.x : existing.x
    const y = finite(payload.y) ? payload.y : existing.y
    const dx = x - existing.x
    const dy = y - existing.y
    const shapeData = existing.shapeData
      ? {
          kind: existing.shapeData.kind,
          strokeColor: existing.shapeData.strokeColor,
          fillColor: existing.shapeData.fillColor,
          strokeWidth: existing.shapeData.strokeWidth,
          points:
            existing.shapeData.kind === 'LINE'
              ? this.normalizeLinePoints(
                  {
                    points: existing.shapeData.points,
                    x1:
                      finite(payload.x1) && !finite(payload.x)
                        ? payload.x1
                        : undefined,
                    y1:
                      finite(payload.y1) && !finite(payload.y)
                        ? payload.y1
                        : undefined,
                    x2:
                      finite(payload.x2) && !finite(payload.x)
                        ? payload.x2
                        : undefined,
                    y2:
                      finite(payload.y2) && !finite(payload.y)
                        ? payload.y2
                        : undefined,
                  },
                  {
                    x: existing.x,
                    y: existing.y,
                    width: existing.width,
                    height: existing.height,
                  },
                )
              : existing.shapeData.points,
        }
      : undefined

    if (shapeData?.kind === 'LINE' && (finite(payload.x) || finite(payload.y))) {
      shapeData.points = {
        x1: shapeData.points.x1 + dx,
        y1: shapeData.points.y1 + dy,
        x2: shapeData.points.x2 + dx,
        y2: shapeData.points.y2 + dy,
      }
    }

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
      shapeData,
    })

    return this.toClientObject(updated)
  }

  async deleteObject(boardId, objectId) {
    const existing = await this.repo.findObjectById(objectId)
    if (!existing || existing.boardId !== boardId) {
      const err = new Error('Объект не найден')
      err.statusCode = 404
      throw err
    }
    await this.repo.deleteObject(objectId)
    return { id: objectId }
  }
}
