const schedule = require('node-schedule')
const redis = require("../utils/redis")
const cnSnk = require('../src/snkrsCn');
const ONE_MIN_INTERVAL = '0 0 0/1 * * *'
module.exports = function () {
  schedule.scheduleJob(ONE_MIN_INTERVAL, () => {
    cnSnk()
    console.log('执行snkrs', new Date())
  })
}
