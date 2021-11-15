class uniteResponse {
  constructor (option = {}) {
    this.response = {}
    this.option = option
  }

  success (data = {}, msg, code) {
    let result = null
    if (!Array.isArray(data)) {
      result = data
    } else {
      if (!data.list) throw new Error('place pass key: "list"')
      if (data.list)
        result = {
          total: data.total,
          list: data.list
        }
    }
    this.response = {
      status: code || this.option.code || 1,
      message: msg || this.option.message || '成功',
      result
    }

    return this.response
  }

  fail (msg, code) {
    this.response = {
      status: code || this.option.code || 0,
      message: msg || this.option.message || '失败',
      result: null
    }

    return this.response
  }
}

module.exports = new uniteResponse()
