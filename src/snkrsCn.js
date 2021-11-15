const snkrsCnModel = require('../models/snkcn')
const request = require('../utils/request')
const dayjs = require('dayjs')
const utils = require('../utils/util')
const wechatMessage = require('../plugins/wechat')
const { pushTask } = require('../plugins/delayQueue')
const SNKRS_URL = 'https://api.nike.com/product_feed/threads/v2/?anchor=0&count=10&filter=marketplace%28CN%29&filter=language%28zh-Hans%29&filter=channelId%28010794e5-35fe-4e32-aaff-cd2c74f89d61%29&filter=exclusiveAccess%28true%2Cfalse%29&fields=active&fields=id&fields=lastFetchTime&fields=productInfo&fields=publishedContent.nodes&fields=publishedContent.properties.coverCard&fields=publishedContent.properties.productCard&fields=publishedContent.properties.products&fields=publishedContent.properties.publish.collections&fields=publishedContent.properties.relatedThreads&fields=publishedContent.properties.seo&fields=publishedContent.properties.threadType&fields=publishedContent.properties.custom&fields=publishedContent.properties.title'
const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36'
}

async function fetchData() {
  let data = {}
  try {
    data = await request.get(SNKRS_URL, {}, headers)
  } catch (e) {
    console.error('爬取数据失败')
    return {}
  }
  return data
}

/**
 * 过滤不要的字段
 */
function filterShoes(data) {
  let shoesList = []
  if (!data.objects) return
  data.objects.length && data.objects.forEach((v, index) => {
    let title = v.publishedContent.properties.seo.title // 例Air Jordan 1 'Rust Shadow' 发布日期
    title.search('发布日期') !== -1 ? (title = title.substr(0, title.length - 4)) : null // 把发布日期字符串切掉

    // 寻找鞋码
    if (v.productInfo && v.productInfo.length) {
      v.productInfo.forEach((product) => {
        let usStock = []
        let cnStock = []
        if (product.skus.length) {
          // stock = stock === '' ? sku.nikeSize : `${stock}, ${sku.nikeSize}` // 有多个尺寸需要拼接
          product.skus.forEach(sku => {
            usStock.push(sku.nikeSize)
            cnStock.push(sku.countrySpecifications[0].localizedSize)
          })
        }
        const method = product.launchView ? product.launchView.method : product.merchProduct.publishType
        const publishTime = product.launchView
          ? dayjs(product.launchView.startEntryDate).format('YYYY/MM/DD HH:mm')
          : dayjs(product.merchProduct.commerceStartDate).format('YYYY/MM/DD HH:mm')
        shoesList.push({
          usSize: usStock,
          cnSize: cnStock,
          method,
          publishTime,
          title: title ? title : product.productContent.title,
          image: product.imageUrls.productImageUrl,
          productId: product.availability.productId
        })
      })
    }
  })
  return shoesList
}

async function distinctShoes(shoesList) {
  // 去重
  const productIds = shoesList.map(item => item.productId)
  const findData = await snkrsCnModel.find({ productId: { $in: productIds } })
  if (!findData.length && findData.length === productIds.length) return
  const subSetData = utils.removeExisted(findData, shoesList, 'productId')
  !!subSetData.length && addTask(subSetData)
  !!subSetData.length && sendWechatMessage(subSetData)
  await saveData(subSetData)
}

function addTask (data) {
  data.forEach(item => {
    pushTask(item.productId, item.publishTime, item)
  })
}

function sendWechatMessage(data) {
  const unSendList = []
  for (let i = 0; i < data.length; i++) {
    const ele = data[i]
    unSendList.push({
      title: (ele.title) + (data.length > 1 ? `(${ele.publishTime})`: ''),
      description: `
        US: ${ele.usSize.join('，')}\n
        CN: ${ele.cnSize.join('，')}\n
        抽取方法: ${ele.method}\n
        时间: ${ele.publishTime}\n
      `,
      url: '#',
      picurl: ele.image
    })
  }
  const res = wechatMessage.sendNews({
    "news": {
      "articles": unSendList
    }
  }).then(data => {
    console.log('发送消息成功', data)
  })
}

async function saveData(data) {
  try {
    await snkrsCnModel.create(data)
  } catch (e) {
    console.log(e)
  }
}

module.exports = async () => {
  const data = await fetchData()
  const filterData = filterShoes(data)
  await distinctShoes(filterData)
}
