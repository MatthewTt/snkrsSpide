const schedule = require('node-schedule')
const delayQueue = require('../plugins/delayQueue')
const wechatMessage = require('../plugins/wechat')
module.exports = function () {
  schedule.scheduleJob('30 * * * * *', () => {
    delayQueue.scanTask(res => {
      return new Promise((resolve, reject) => {
        console.log(res)
        wechatMessage.sendText(`【${res.body.title}】 5分钟 后开抢, 进入snkrs查看`).then(doc => {
          resolve(doc)
        }).catch((err) => {
          reject(err)
        })
      })
    })
  })
}
