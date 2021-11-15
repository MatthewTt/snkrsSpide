const uniteResponse = require('../middleware/uniteResponse')
const MenuModel = require('../models/Menu')
module.exports = (app) => {
  const router = require('express').Router()
  const MenuModel = require('../models/Menu')
  router.post('/saveMenu', ((req, res) => {
    const { title, name, parentId, path, icon } = req.body
    MenuModel.create({ title, name, parentId, level: 0, path, icon }, (err, doc) => {
      if (err) {
        console.log(err)
        return res.send(uniteResponse.fail(err))
      }
      res.send(uniteResponse.success(doc))
    })
  }))

  router.get('/listMenu', (req, res) => {
    const { pageNumber, pageSize } = req.query
    Promise.all([
      MenuModel.find({}).populate('children').limit(pageSize).skip((pageSize - 1) * pageNumber),
      /*MenuModel.aggregate([
        {
          $graphLookup: {
            from: 'menus',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parentId',
            as: 'children'
          }
        }, {
          $group: {
            _id: '$_id',
            children: { $push: '$children' },
            title: { $first: '$title' },
            name: { $first: '$name' }
          }
        }
      ]),*/
      MenuModel.countDocuments()
    ]).then(([ list, total ]) => {
      const testArr = [ { _id: '001', parentId: '-1', name: 'node_1' }, { _id: '0011', parentId: '001', name: 'node_1-1' }, { _id: '00111', parentId: '0011', name: 'node_1-1-1' }, { _id: '002', parentId: '-1', name: 'node_2' }]
      // console.log(list, 919)
      const toArr = arrayToTree(JSON.parse(JSON.stringify(list)))
      // console.log(toArr)
      res.send(uniteResponse.success({ list: toArr, total }))
    })
  })

  router.get('/removeMenu', (req, res) => {
    const { id } = req.query
    MenuModel.findByIdAndDelete(id).exec((err, doc) => {
      if (err) {
        return res.send(uniteResponse.fail())
      }
      res.send(uniteResponse.success())
    })
  })


  function buildTree (list, rootId) {
    const tree = []
    const obj = {}
    /*list.forEach(v => {
      const element = v
      const id = element._id // id当作key作为映射
      const parentId = element.parentId
      obj[id] = !obj[id] ? v : { ...v, ...obj[id] } // 元素可能已存在obj中
      const treeItem = obj[id]
      console.log(treeItem, 999)
      if (parentId === rootId) {  // 如果遇见根元素直接push进数组
        tree.push(treeItem)
      } else {
        if (!obj[parentId].children) { // 若无children, 初始化一个
          obj[parentId].children = []
        }
        obj[parentId].children.push(treeItem)
      }
    })*/
    for (const element of list) {
      const id = element._id
      const parentId = element.parentId

      obj[id] = !obj[id] ? element : { ...element, ...obj[id] }
      const treeItem = obj[id]
      if (parentId === '-1') {
        tree.push(treeItem)
      } else {
        if (!obj[parentId]) {
          obj[parentId] = {}
        }

        if (!obj[parentId]['children']) {
          console.log('没有children')
          obj[parentId]['children'] = []
        }

        obj[parentId].children.push(treeItem)
        console.log(obj[parentId])

      }

    }
    console.log(obj, 99)
    return tree
  }

  /** * 方法二：非递归实现（映射 + 引用） * 前提：每一项都有parentId，根元素 * @param {Array} list 数组 * @param {String} rootId 根元素id * @param {Object} param2 可配置参数 */
  const generateTree2 = (list, rootId, {
    idName = '_id',
    parentIdName = 'parentId',
    childName = 'children'
  } = {}) => {
    if (!Array.isArray(list)) {
      new Error('only Array')
      return list
    }
    const objMap = {} // 暂存数组以id为key的映射关系
    const result = [] // 结果
    for (const item of list) {
      const id = item[idName]
      const parentId = item[parentIdName]
      objMap[id] = item
      const treeItem = objMap[id]
      // 找到映射关系那一项（注意这里是引用）
      if (parentId === rootId) {
        // 已经到根元素则将映射结果放进结果集
        result.push(treeItem)
      } else {
        if (!objMap[parentId]) {
          objMap[parentId] = {}
        }
        //若无该根元素则放入map中
        if (!objMap[parentId][childName]) {
          objMap[parentId][childName] = []
        }
        objMap[parentId][childName].push(treeItem)
      }
    }
    return result
  }

  function arrayToTree(items) {
    const result = [];   // 存放结果集
    const itemMap = {};  //
    for (const item of items) {
      console.log(item)
      const id = item._id;
      const pid = item.parentId;

      if (!itemMap[id]) {
        itemMap[id] = {
          children: [],
        }
      }

      itemMap[id] = {
        ...item,
        children: itemMap[id]['children']
      }

      const treeItem =  itemMap[id];

      if (pid === '-1') {
        result.push(treeItem);
      } else {
        if (!itemMap[pid]) {
          itemMap[pid] = {
            children: [],
          }
        }
        itemMap[pid].children.push(treeItem)
      }

    }
    // console.log(result, 999)
    return result;
  }
  app.use('/menu', router)
}
