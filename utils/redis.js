const redis = require('redis')
const client = redis.createClient()
client.on('error', err => {
  console.log("error", err)
})

client.on('connect', function () {
  console.log('redis连接成功')
})
function getById(key) {
  return new Promise(((resolve, reject) => {
    client.get(key, (err, reply) => {
      resolve(reply)
    })
  }))
}

function updateCache(key, value, expire) {
  return new Promise((resolve, reject) => {
    client.set(key, value)
    if (expire) {
      client.expire(key, expire)
    }
  })
}

function delCache (key) {
  return new Promise(resolve => {
    client.del(key, (err, reply) => {})
    resolve(reply)
  })
}

module.exports = {
  client,
  getById,
  updateCache,
  delCache
}
