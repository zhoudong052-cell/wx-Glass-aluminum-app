const { CATEGORIES } = require('../../config/index')

Page({
  data: {
    categories: CATEGORIES
  },

  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    const app = getApp()
    app.globalData.indexTab = id
    wx.switchTab({ url: '/pages/index/index' })
  }
})
