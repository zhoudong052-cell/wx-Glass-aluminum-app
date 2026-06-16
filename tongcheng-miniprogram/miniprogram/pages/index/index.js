const app = getApp()
const { HOME_BANNERS, HOME_CATEGORIES } = require('../../config/index')
const { recordPageVisit, getStats } = require('../../services/stats')
const { fetchPostList } = require('../../services/post')

const TABS = [
  { id: 'latest', name: '最新信息' },
  { id: 'nearby', name: '附近信息' },
  ...HOME_CATEGORIES.map((c) => ({ id: c.id, name: c.name }))
]

Page({
  data: {
    banners: HOME_BANNERS,
    categories: HOME_CATEGORIES,
    stats: {
      views: 0,
      posts: 0,
      users: 0,
      viewsText: '0',
      postsText: '0',
      usersText: '0'
    },
    notice: '欢迎发布同城招聘、转店、二手等信息',
    keyword: '',
    tabs: TABS,
    activeTab: 'latest',
    list: [],
    loading: false
  },

  onLoad() {
    this.refreshStatsDisplay()
    this.loadList()
  },

  onShow() {
    this.trackPageView()
    const pendingTab = app.globalData.indexTab
    if (pendingTab) {
      app.globalData.indexTab = null
      this.setData({ activeTab: pendingTab })
      this.loadList()
    }
  },

  trackPageView() {
    recordPageVisit()
      .then((stats) => {
        app.setStats(stats)
        this.setData({ stats })
      })
      .catch(() => {
        this.refreshStatsDisplay()
      })
  },

  refreshStatsDisplay() {
    const stats = app.globalData.stats || getStats()
    this.setData({ stats })
  },

  onPullDownRefresh() {
    Promise.all([
      new Promise((resolve) => {
        recordPageVisit()
          .then((stats) => {
            app.setStats(stats)
            this.setData({ stats })
            resolve()
          })
          .catch(resolve)
      }),
      this.loadList()
    ]).finally(() => wx.stopPullDownRefresh())
  },

  loadList() {
    const { activeTab, keyword } = this.data
    this.setData({ loading: true })

    return fetchPostList({
      tab: activeTab,
      keyword,
      city: app.globalData.city
    })
      .then((list) => {
        this.setData({ list, loading: false })
      })
      .catch(() => {
        this.setData({ list: [], loading: false })
      })
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadList()
  },

  onHelp() {
    wx.showModal({
      title: '帮助',
      content: '信息存于云数据库；置顶信息每小时轮换展示在列表第一条。',
      showCancel: false
    })
  },

  onMessageTap() {
    wx.switchTab({ url: '/pages/supplier/supplier' })
  },

  onCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    app.globalData.indexTab = id
    this.setData({ activeTab: id })
    this.loadList()
  },

  onTabChange(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeTab: id })
    this.loadList()
  }
})
