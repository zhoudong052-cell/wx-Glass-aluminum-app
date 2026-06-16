const {
  SUPPLIER_BANNERS,
  SUPPLIER_MODULES,
  SUPPLIER_TABS
} = require('../../config/supplier')
const { getVendorNames, filterMerchants } = require('../../services/merchant')

Page({
  data: {
    banners: SUPPLIER_BANNERS,
    bannerHeight: 120,
    vendorNotices: [],
    modules: SUPPLIER_MODULES,
    tabs: SUPPLIER_TABS,
    activeTab: 'recommend',
    activeModuleId: '',
    merchantList: []
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    const bannerHeight = Math.round(sys.windowHeight / 6)
    this.setData({ bannerHeight })
    this.refreshPage()
  },

  onShow() {
    this.refreshPage()
  },

  onPullDownRefresh() {
    this.refreshPage()
    wx.stopPullDownRefresh()
  },

  refreshPage() {
    const vendorNotices = getVendorNames()
    const merchantList = filterMerchants({
      tab: this.data.activeTab,
      moduleId: this.data.activeModuleId
    })
    this.setData({ vendorNotices, merchantList })
  },

  onModuleTap(e) {
    const { id, link } = e.currentTarget.dataset
    if (link) {
      wx.navigateTo({ url: '/pages/merchant-join/merchant-join' })
      return
    }
    const moduleId = this.data.activeModuleId === id ? '' : id
    this.setData({ activeModuleId: moduleId })
    this.refreshPage()
  },

  onTabChange(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeTab: id })
    this.refreshPage()
  },

  onMerchantTap(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({ title: `商家 ${id}`, icon: 'none' })
  }
})
