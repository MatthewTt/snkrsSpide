const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  title: String,
  productId: String,
  title: String,
  publishTime: String,
  method: String,
  usSize: [{type: String}],
  cnSize: [{type: String}],
  image: String,
  created: { type: Date, default: Date.now() }
})

module.exports = mongoose.model('Snkrscn', schema)
