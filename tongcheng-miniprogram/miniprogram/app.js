const { API_BASE, CLOUD_ENV_ID } = require('./config/index')
const { resetStatsIfNeeded } = require('./services/stats')

App({
  globalData: {
    userInfo: null,
    city: '本地',
    location: null,
    apiBase: API_BASE,
    stats: null,
    indexTab: null,
    membership: null
  },


  onLaunch() {
    this.globalData.stats = resetStatsIfNeeded()
    this.initCity()
    this.initCloud()
    this.checkUpdate()
  },

  initCity() {
    const cached = wx.getStorageSync('city')
    if (cached) {
      this.globalData.city = cached
    }
  },

  initCloud() {
    if (!CLOUD_ENV_ID || !wx.cloud) return
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true
    })
  },

  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) return
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已准备好，是否重启应用？',
        success(res) {
          if (res.confirm) updateManager.applyUpdate()
        }
      })
    })
  },

  setCity(city) {
    this.globalData.city = city
    wx.setStorageSync('city', city)
  },

  setStats(stats) {
    this.globalData.stats = stats
  }
})
