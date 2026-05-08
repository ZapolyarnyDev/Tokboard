import 'dotenv/config'
import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
const port = process.env.PORT ?? 3000

import { BoardRepository } from './src/modules/board/repository.js'
import { BoardService } from './src/modules/board/service.js'
import { BoardGateway } from './src/modules/board/gateway.js'
import { authRouter } from './src/modules/auth/router.js'

const corsOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((s) => s.trim())
  .filter(Boolean)
app.use(
  cors({
    origin: corsOrigins?.length ? corsOrigins : true,
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(express.json())

app.use('/auth', authRouter)
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
