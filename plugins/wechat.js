// import { companySecret, companyId } from "../config/index";
const config = require('../config/index')
const request = require('../utils/request')
// import { updateCache } from "../utils/redis";
const redis = require('../utils/redis')

const TwoHours = 60 * 60 * 2

class WechatMessage {
  wechatApi = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${config.companyId}&corpsecret=${config.companySecret}`

  /*constructor() {
    this.accessToken = ''
  }*/
  async fetchAccessToken() {
    const res = await request.post(this.wechatApi)
    if (res.errcode === 0) {
      // this.accessToken = res.access_token
      redis.updateCache('accessToken', res.access_token, TwoHours)
      return res.access_token
    }
  }

  async sendMessage (msgType, data) {
    const messageApi = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${await redis.getById('accessToken')}`
    console.log(msgType, data)
    const result = request.post(messageApi, {
      ...data,
      touser: data.touser || '@all',
      msgtype: msgType,
      agentid: config.agentId,
    }).then(data => {
      return data
    }).catch(e => {
      console.log(e)
    })
    return result
  }

  async sendText(content, touser) {
    const res = this.sendMessage('text', {
        text: {content},
      touser
      }
    )
    return res
  }

  sendMarkdown(content, toUser) {
    return this.sendMessage('markdown', {
      markdown: {
        content,
        touser: toUser
      }
    })
  }

  sendNews(data) {
    return this.sendMessage('news', {
      ...data
    })
  }

  async uploadFile(type, data) {
    const token = await redis.getById('accessToken')
    const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`
    const file = new FormData()
    file.append('media', data)
    return new Promise(async (resolve, reject) => {
      request.post(uploadUrl, file, {
        'Content-Type': 'multipart/form-data'
      }).then(async data => {
        resolve(await data)
      })
    })
  }
}

module.exports = new WechatMessage()
