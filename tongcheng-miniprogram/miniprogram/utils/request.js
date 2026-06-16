const { API_BASE } = require('../config/index')

const request = (options) => {
  const { url, method = 'GET', data = {}, header = {} } = options
  const token = wx.getStorageSync('token')

  return new Promise((resolve, reject) => {
    wx.request({
      url: url.startsWith('http') ? url : `${API_BASE}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        reject(res)
      },
      fail: reject
    })
  })
}

module.exports = { request }
