// 数组对象
function subSet(arr1, arr2, key) {
  if (key && key !== '') {
    const mergeArr = arr1.concat(arr2).reduce((pre, current) => {
      if (pre[current[key]] && pre[current[key]][key] === current[key]) {
        delete pre[current[key]]
      } else {
        pre[current[key]] = current
      }
      console.log(pre)
      return pre
    }, {})
    return Object.values(mergeArr)
  }
}

/**
 * 数据对象
 * @param arr1
 * @param arr2
 * @param key
 */
function removeExisted (arr1, arr2, key) {
  const tempArr = []
  const products = arr1.map(item => item[key])
  arr2.forEach(item => {
    const hasExist = products.includes(item[key]) // 查看arr1中是否存在
    if (!hasExist) {
      tempArr.push(item)
    }
  })
  return tempArr
}

module.exports = {
  subSet,
  removeExisted
}
