module.exports = app => {
  const mongoose = require('mongoose')
  mongoose.connect('mongodb://localhost/snkrs', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(res => console.log('Connected')).catch(error => console.log(error))
}
