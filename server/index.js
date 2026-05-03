import 'dotenv/config'
import express from 'express'

const app = express()
const port = process.env.PORT

import { BoardGateway } from './modules/board/board.gateway.js'
import { BoardRepository } from './modules/board/board.repository.js'
import { BoardService } from './modules/board/board.service.js'

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
