const { formatTime, formatRelativeTime } = require('../../utils/util')
const { fetchPostDetail } = require('../../services/post')

Page({
  data: {
    id: '',
    detail: null
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({ title: '信息不存在', icon: 'none' })
      return
    }
    this.setData({ id })
    this.loadDetail(id)
  },

  loadDetail(postId) {
    wx.showLoading({ title: '加载中' })
    fetchPostDetail(postId)
      .then((post) => {
        wx.hideLoading()
        this.setData({
          detail: {
            ...post,
            contact: `${post.contactName} ${post.phone}`,
            createdAt: formatRelativeTime(post.createdAt)
          }
        })
      })
      .catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
  },

  onContact() {
    const { detail } = this.data
    if (!detail || !detail.phone) return
    wx.showModal({
      title: '联系发布者',
      content: `${detail.contactName || ''} ${detail.phone}`,
      confirmText: '拨打',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: detail.phone })
        }
      }
    })
  }
})
