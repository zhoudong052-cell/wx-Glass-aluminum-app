const { MEMBERSHIP_PLANS } = require('../../config/index')
const { fetchMyMembership, purchaseMembership } = require('../../services/membership')
const { formatTime } = require('../../utils/util')

Page({
  data: {
    plans: MEMBERSHIP_PLANS,
    selectedPlan: 'month',
    membership: null,
    expireText: '',
    submitting: false
  },

  onShow() {
    this.loadMembership()
  },

  loadMembership() {
    fetchMyMembership().then((m) => {
      if (!m) {
        this.setData({ membership: null, expireText: '' })
        return
      }
      this.setData({
        membership: m,
        expireText: formatTime(m.expireAt),
        selectedPlan: m.planId || 'month'
      })
    })
  },

  onSelectPlan(e) {
    this.setData({ selectedPlan: e.currentTarget.dataset.id })
  },

  onPurchase() {
    const { selectedPlan } = this.data
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === selectedPlan)
    if (!plan) return

    wx.showModal({
      title: '确认开通',
      content: `开通「${plan.name}」¥${plan.price}（演示模式，正式版请接入微信支付）`,
      success: (res) => {
        if (!res.confirm) return
        this.setData({ submitting: true })
        purchaseMembership(selectedPlan)
          .then((m) => {
            this.setData({ submitting: false })
            wx.showToast({ title: '开通成功', icon: 'success' })
            this.setData({
              membership: m,
              expireText: formatTime(m.expireAt)
            })
          })
          .catch((err) => {
            this.setData({ submitting: false })
            wx.showToast({ title: err.message || '开通失败', icon: 'none' })
          })
      }
    })
  }
})
