const multer = require('multer')
module.exports = (app) => {
  const router = require('express').Router()
  const upload = multer({ dest: __dirname + '/../uploads' })

  router.post('/file', upload.single('file'), (req, res) => {
    const file = req.file
    console.log(file)
    file.url = `http://localhost:5000/uploads/${file.filename}`
    res.send(file)
  })

  app.use('/upload', router)
}
