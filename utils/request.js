const superagent = require('superagent')

class Request {
  get(url, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      superagent
        .get(url)
        .send(data)
        .set(headers)
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body)
          }
        })
    })
  }

  post(url, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      superagent
        .post(url)
        .send(data)
        .set(headers)
        .end((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res.body)
          }
        })
    })
  }

}

module.exports = new Request()
