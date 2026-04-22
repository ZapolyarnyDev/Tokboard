import 'dotenv/config';
import express from 'express';

const app = express()
const port = process.env.PORT

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok'
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
