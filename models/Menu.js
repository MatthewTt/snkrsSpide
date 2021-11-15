const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  title: String,
  name: String,
  parentId: {type: String, default: "-1"},
  level: Number,
  path: String,
  icon: String,
})

/* schema.virtual('children', {
  localField: '_id',
  foreignField: 'parentId',
  ref: 'Menu',
  justOne: false
}) */

module.exports = mongoose.model('Menu', schema)
