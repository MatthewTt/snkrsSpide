const AdminUserModel = require('../models/AdminUser')
const uniteResponse = require('../middleware/uniteResponse');
const jwt = require('jsonwebtoken')
const assert = require('http-assert');
module.exports = (app) => {
  const router = require('express').Router()
  router.post('/addUserInfo', (req, res) => {
    const { username, password, email, avatar } = req.body
    AdminUserModel
      .create(req.body, (err, doc) => {
        if (err) {
          return res.send(uniteResponse.fail())
        }
        res.send(uniteResponse.success(doc))
      })
  })

  router.post('/delUserInfo', (req, res) => {
    const { userId } = req.body
    AdminUserModel.findByIdAndDelete(userId).exec((err, doc) => {
      if (err) return res.send(uniteResponse.fail())
      res.send(uniteResponse.success(doc))
    })
  })

  router.post('/updateUserInfo', (req, res) => {
    const { _id } = req.body
    AdminUserModel.findByIdAndUpdate(_id, req.body, (err, doc) => {
      if (err) return uniteResponse.fail()
      res.send(uniteResponse.success(doc))
    })
  })

  router.get('/getUserDataById', (req, res) => {
    const { userId } = req.query
    AdminUserModel
      .findById(userId)
      .exec((err, doc) => {
        if (err) {
          res.send(uniteResponse.fail('失败'))
        } else {
          res.send(uniteResponse.success(doc))
        }
      })
  })

  router.get('/listUser', (req, res) => {
    const { pageSize = 10, pageNumber = 1 } = req.query
    Promise.all([
      AdminUserModel.countDocuments(),
      AdminUserModel
        .find({})
        .skip(pageSize * (pageNumber - 1))
        .limit(pageSize)
    ]).then(([ total, data ]) => {
      // console.log(doc, 'ListUser')
      res.send(uniteResponse.success({ total, list: data }))
    })
  })

  router.get('/getUserInfo', (req, res) => {
    const { userId } = req.query
    AdminUserModel.findById(userId).then(doc => {
      res.send(uniteResponse.success(doc))
    }).catch(err => {
      res.send(uniteResponse.fail('失败', err))
    })
  })

  router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const findUser = await AdminUserModel.findOne({ username }).select('+password')
    assert(findUser, 422, '账号不存在')
    const isValid = require('bcrypt').compareSync(password, findUser.password)
    assert(isValid, 422, '输入的密码不正确')
    // 生成token
    const token = jwt.sign({ id: findUser._id }, 'demaXiya')
    res.send(uniteResponse.success({
      accessToken: token,
      avatar: findUser.avatar,
      email: findUser.email,
      username: findUser.username
    }))
  })

  app.use('/user', router)
}
