app.post('/boards/:id/object', async (req, res) => {
  const obj = await boardService.createObject(req.body)
  res.json(obj)
})
