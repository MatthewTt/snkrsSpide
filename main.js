
const express = require('express')
const app = express()
// const path = require('path-exists')
app.use(require('cors')())
app.use(express.json())

app.use('/uploads', express.static(__dirname + '/uploads')) // 可直接访问的内容
app.use('/public', express.static(__dirname + '/public')) // 可直接访问的内容
require('./utils/db')(app)
require('./utils/redis')

// const childProcess = require('child_process')
require('./routers/index')(app)
require('./src/snkrsCn')()
require('./schedules')

/*const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true})
const kittySchema = new mongoose.Schema({
  name: String
});
const Kitten = mongoose.model('Kitten', kittySchema);
Kitten.create({name: '123'})*/

/*const works = []
const processList = [
  './src/snkrsCn'
]
processList.forEach((i) => {
  works.push(childProcess.fork(i))
})

for (let i = 0; i < works.length; i++) {
  works[i].on('exit', (i => {
      return () => {
        works[i] = childProcess.fork(processList[i])
      }
    })(i)
  )
}*/


app.listen(5000, (host) => {
  console.log('端口', host)
})
/*
const wechatC = require('./plugins/wechat')
// const wechat = new wechatC()
wechatC.fetchAccessToken()
*/
