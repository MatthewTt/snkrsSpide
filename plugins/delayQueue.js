/**
 * 延迟队列
 */

const { client } = require('../utils/redis.js')
const { v4 } = require('uuid')
const QUEUE_NAME = 'expireShoe'
const QUEUE_POOL = 'taskPool'
const FIVE_MIN = 1000 * 60 * 5
client.selected_db = 1

/**
 * 添加任务
 * @param id 任务唯一值
 * @param date date执行
 * @param ttl 失败后延迟多少时间再次执行
 * @param body 任务信息
 */
function pushTask (id, date, body, ttl = 30) {
  id = (id || v4()).toString()
  let task = {
    id,
    timestamp: new Date(date).getTime() - FIVE_MIN,
    body,
    ttl
  }

  return client.multi() // 事务, 都添加成功才行
    .hset(QUEUE_POOL, id, JSON.stringify(task))
    .zadd(QUEUE_NAME, task.timestamp, id) // score 可以重复, 成员不可以重复
    .exec(() => {
      console.log(`${id}任务添加成功, 任务详情: ${JSON.stringify(task)}`)
    })
}

function scanTask (fn) {
  client.zrangebyscore(QUEUE_NAME, 1, new Date().getTime(), 'LIMIT', 0, 2, async (err, result) => {
    if (result.length > 0) {
      // 大于零给搜索到的设置成0, 代表执行中
      const tasks = result.reduce(async (pre, current) => {
        client.zadd(QUEUE_NAME, 0, current)
        const taskInfo = await taskById(current)
        fn(taskInfo).then(() => {
          finishTask(taskInfo.id)
        }).catch(() => {
          failTask(Date.now() + taskInfo.ttl, taskInfo.id)
        })
        // pre.push(0)
        // pre.push(current)
        return pre
      }, [])
      // 修改成0
      // client.zadd([ QUEUE_NAME ].concat(await tasks))
    }
  })
}

// 完成任务, 移除
function finishTask (id) {
  client.multi()
  .hdel(QUEUE_POOL, id)
  .zrem(QUEUE_NAME, id)
  .exec(() => {
    console.log(`${id}任务执行完成, 已从队列中移除`)
  })
}

async function taskById (id) {
  return new Promise(resolve => {
    client.hget(QUEUE_POOL, id, (err, res) => {
      resolve(res && JSON.parse(res))
    })
  })
}

function failTask (timestamp, id) {
  client.zadd(QUEUE_NAME, timestamp, id, (err, res) => {
    console.log(`${id}任务执行失败, 已添加到失败队列, 等待执行`)
  })
}

module.exports = {
  scanTask,
  pushTask
}
