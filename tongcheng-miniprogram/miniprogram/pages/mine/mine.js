const app = getApp()
const { fetchMyMembership } = require('../../services/membership')
const { formatTime } = require('../../utils/util')

const DEFAULT_AVATAR = '/images/default-avatar.png'

const SERVICE_LIST = [
  { id: 'member', name: '会员中心', icon: '◆', bg: '#fff8e1', action: 'membership' },
  { id: 'publish', name: '我的发布', icon: '📝', bg: '#fff3e0', action: 'myPosts' },
  { id: 'supplier', name: '供应商', icon: '🏭', bg: '#fce4ec', action: 'supplier' },
  { id: 'join', name: '申请加盟', icon: '🤝', bg: '#f3e5f5', action: 'merchantJoin' },
  { id: 'auth', name: '我的认证', icon: '✓', bg: '#e8f5e9', action: 'auth' },
  { id: 'like', name: '我的点赞', icon: '👍', bg: '#fce4ec', action: 'likes' }
]

const TOOL_LIST = [
  { id: 'notify', name: '开启通知', icon: '🔔', bg: '#fff8e1', action: 'notify' },
  { id: 'service', name: '平台客服', icon: '🎧', bg: '#e3f2fd', action: 'contact' },
  { id: 'help', name: '帮助中心', icon: '❓', bg: '#e8f5e9', action: 'help' },
  { id: 'about', name: '关于我们', icon: 'ℹ', bg: '#f5f5f5', action: 'about' }
]

Page({
  data: {
    statusBarHeight: 20,
    userInfo: null,
    nickName: '点击登录',
    avatarUrl: DEFAULT_AVATAR,
    uid: '------',
    stats: {
      coins: 0,
      wallet: '0.00',
      messages: 0
    },
    serviceList: SERVICE_LIST,
    toolList: TOOL_LIST,
    memberTip: '查看专属特权'
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
    this.initUid()
  },

  onShow() {
    this.syncUser()
    this.loadStats()
    this.loadMembership()
  },

  loadMembership() {
    fetchMyMembership().then((m) => {
      app.globalData.membership = m
      if (m && m.isActive) {
        this.setData({
          memberTip: `${m.planName} · 至${formatTime(m.expireAt).split(' ')[0]}`
        })
      } else {
        this.setData({ memberTip: '查看专属特权' })
      }
    })
  },

  initUid() {
    let uid = wx.getStorageSync('user_uid')
    if (!uid) {
      uid = String(Math.floor(10000 + Math.random() * 89999))
      wx.setStorageSync('user_uid', uid)
    }
    this.setData({ uid })
  },

  syncUser() {
    const { userInfo } = app.globalData
    if (userInfo) {
      this.setData({
        userInfo,
        nickName: userInfo.nickName || '微信用户',
        avatarUrl: userInfo.avatarUrl || DEFAULT_AVATAR
      })
    }
  },

  loadStats() {
    const globalStats = app.globalData.stats
    const coins = wx.getStorageSync('user_coins') || 0
    const messages = globalStats ? 0 : 0
    this.setData({
      stats: {
        coins,
        wallet: '0.00',
        messages
      }
    })
  },

  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于展示头像昵称',
      success: (res) => {
        app.globalData.userInfo = res.userInfo
        this.syncUser()
      }
    })
  },

  onProfile() {
    if (!this.data.userInfo) {
      this.onGetUserProfile()
      return
    }
    wx.showToast({ title: '资料页开发中', icon: 'none' })
  },

  onSettings() {
    wx.showToast({ title: '设置开发中', icon: 'none' })
  },

  onMemberCard() {
    wx.showToast({ title: '会员特权开发中', icon: 'none' })
  },

  onStatTap(e) {
    const { type } = e.currentTarget.dataset
    if (type === 'message') {
      wx.showToast({ title: '暂无新消息', icon: 'none' })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onServiceTap(e) {
    const { action } = e.currentTarget.dataset
    const map = {
      membership: () => wx.navigateTo({ url: '/pages/membership/membership' }),
      myPosts: () => wx.navigateTo({ url: '/pages/my-posts/my-posts' }),
      supplier: () => wx.switchTab({ url: '/pages/supplier/supplier' }),
      merchantJoin: () => wx.navigateTo({ url: '/pages/merchant-join/merchant-join' }),
      auth: () => wx.showToast({ title: '认证功能开发中', icon: 'none' }),
      likes: () => wx.showToast({ title: '暂无点赞记录', icon: 'none' })
    }
    const fn = map[action]
    if (fn) fn()
  },

  onToolTap(e) {
    const { action } = e.currentTarget.dataset
    if (action === 'notify') {
      wx.requestSubscribeMessage({
        tmplIds: [],
        complete: () => wx.showToast({ title: '请在设置中开启通知', icon: 'none' })
      })
      return
    }
    if (action === 'contact') {
      wx.showModal({
        title: '平台客服',
        content: '请在工作时间拨打客服热线或添加微信客服（请在后台配置）',
        showCancel: false
      })
      return
    }
    if (action === 'help') {
      wx.showModal({
        title: '帮助中心',
        content: '发布信息请确保真实有效；供应商入驻请进入「供应商-商家入驻」。',
        showCancel: false
      })
      return
    }
    if (action === 'about') {
      wx.showModal({
        title: '关于我们',
        content: '同城信息发布与供应商服务平台',
        showCancel: false
      })
    }
  }
})
