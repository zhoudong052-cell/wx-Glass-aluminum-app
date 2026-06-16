const { CLOUD_ENV_ID } = require('../config/index')

const isCloudEnabled = () => !!(wx.cloud && CLOUD_ENV_ID)

const getDb = () => {
  if (!isCloudEnabled()) {
    throw new Error('请先配置云开发环境 ID')
  }
  return wx.cloud.database()
}

module.exports = {
  isCloudEnabled,
  getDb,
  CLOUD_ENV_ID
}
