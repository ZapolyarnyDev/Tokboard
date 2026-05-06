import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

const app = express()
const port = process.env.PORT ?? 3000

import { BoardRepository } from './src/modules/board/repository.js'
import { BoardService } from './src/modules/board/service.js'
import { BoardGateway } from './src/modules/board/gateway.js'

app.use(express.json())
const server = createServer(app)
const wss = new WebSocketServer({ server })

const boardRepository = new BoardRepository()
const boardService = new BoardService(boardRepository)
const boardGateway = new BoardGateway(boardService)

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
  })
})

wss.on('connection', (ws) => {
  boardGateway.handleConnection(ws)
})

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
