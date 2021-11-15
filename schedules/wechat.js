const wechatMessage = require('../plugins/wechat')
const schedule = require('node-schedule')
const redis = require("../utils/redis");
const THREE_HOUR = '0 30 1/3 * * *' // 从1点30分开始, 间隔3小时执行一次
const THREE_HALF_HOUR = '0 0 0/3 * * *' // 0点开始, 每三小时执行一次
async function taskWechatToken() {
  // 如果redis中没有token, 立即获取一次
  const token = await redis.getById('accessToken')
  if (!token) {
    wechatMessage.fetchAccessToken()
  }
  schedule.scheduleJob(THREE_HOUR, () => {
    console.log('定时任务1:', new Date())
    wechatMessage.fetchAccessToken()
  })

  schedule.scheduleJob(THREE_HALF_HOUR, () => {
    console.log('定时任务2:', new Date())
    wechatMessage.fetchAccessToken()
  })
}

module.exports = taskWechatToken
