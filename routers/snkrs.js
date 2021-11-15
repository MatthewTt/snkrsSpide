const snkcnModel = require('../models/snkcn')
const uniteResponse = require('../middleware/uniteResponse');
const dayjs = require('dayjs')
const wechatMessage = require('../plugins/wechat')
const delay = require('../plugins/delayQueue')
module.exports = (app) => {
  const router = require('express').Router()
  /**
   * 用户列表
   */
  router.get('/listShoes', async (req, res) => {
    console.log(req.query)
    const { pageSize = 10, pageNumber = 1 } = req.query
    const [ total, result ] = await Promise.all([
      snkcnModel.countDocuments(),
      snkcnModel.find().skip(parseInt(pageSize) * (+pageNumber - 1)).limit(parseInt(pageSize))
    ])
    res.send(uniteResponse.success({ total, list: result }))
  })

  router.get('/sendTomorrow', (req, res) => {
    const tomorrow = dayjs(new Date()).add(1, 'day').format('YYYY/MM/DD')
    const afterTomorrow =  dayjs(new Date()).add(2, 'day').format('YYYY/MM/DD')
    snkcnModel.find({
      publishTime: { $gt: tomorrow, $lt: afterTomorrow }
    }).exec((err, doc) => {
      if (doc.length <= 0) return res.send(uniteResponse.success(null, '暂无明日预告'))
      let str = "##🎈🎈 预告🎈🎈 ## \n"
      doc.forEach(shoe => {
        str += `名称: ${shoe.title} \n时间: ${shoe.publishTime} \n-------------------------------\n`
      })
      /*wechatMessage.sendMarkdown(str, 'LiuJiaJie').then(res => {
        console.log(res, 88888)
      })*/
      wechatMessage.sendText(str).then(result => {
        if (result.errcode === 0) {
          res.send(uniteResponse.success({}))
        }
      })
    })
  })
  router.get('/delay', (req, res) => {
    delay.scanTask()
    res.send('success')
  })
  app.use('/snkrs', router)
}
