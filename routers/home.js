const express = require('express')
const router = express.Router()
const snkrsCnModel = require('../models/snkcn')
const wechat = require('../plugins/wechat')
router.get('/e', async(req, res) => {
  try {
    const result = await wechat.sendText('test')
    res.send(result)
  } catch (e) {
    console.log('发送消息失败', e)
  }
  // const data = await snkrsCnModel.find()
})

router.get('/markdown', async (req, res) => {
  try {
    const result = await wechat.sendMarkdown(">参与者：@miglioguan、@kunliu、@jamdeezhou、@kanexiong、@kisonwang ")
  } catch (e) {
    console.log(e)
  }
})

router.get('/news', async (req, res) => {
  try {
    const result = await wechat.sendNews({
      "news" : {
        "articles" : [
          {
            "title" : "点此获取100斤狗屎",
            "description" : "抽100个人发货100斤狗屎, 分享增加中奖率",
            "url" : "http://baidu.com",
            "picurl" : "https://user-gold-cdn.xitu.io/2019/9/3/16cf72cd9a83fcc9?imageView2/0/w/1280/h/960/format/webp/ignore-error/1"
          }
        ]
      },

    })
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

module.exports = router
