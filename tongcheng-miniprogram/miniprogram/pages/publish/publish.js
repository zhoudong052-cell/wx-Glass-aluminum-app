const { PIN_QR_IMAGE, HOME_CATEGORIES } = require('../../config/index')
const { createPost } = require('../../services/post')
const { isCloudEnabled } = require('../../utils/cloud')

const MODULE_OPTIONS = [{ id: '', name: '请选择发布模块' }, ...HOME_CATEGORIES]

Page({
  data: {
    categories: MODULE_OPTIONS,
    categoryIndex: 0,
    regionCode: [],
    province: '',
    city: '',
    regionText: '',
    regionConfirmed: false,
    content: '',
    contactName: '',
    phone: '',
    pinTop: false,
    pinScanned: false,
    pinQrImage: PIN_QR_IMAGE,
    submitting: false
  },

  onLoad(options) {
    if (options.category) {
      const idx = HOME_CATEGORIES.findIndex((c) => c.id === options.category)
      if (idx >= 0) this.setData({ categoryIndex: idx + 1 })
    }
    if (!isCloudEnabled()) {
      wx.showModal({
        title: '云开发未配置',
        content: '请在 config/index.js 填写 CLOUD_ENV_ID，并在云开发控制台创建 posts 集合',
        showCancel: false
      })
    }
  },

  onModuleChange(e) {
    this.setData({ categoryIndex: Number(e.detail.value) })
  },

  onRegionChange(e) {
    const { value, code } = e.detail
    const province = value[0] || ''
    const city = value[1] || ''
    const regionText = city ? `${province} ${city}` : province

    this.setData({
      regionCode: code || [],
      province,
      city,
      regionText,
      regionConfirmed: !!(province && city)
    })
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  onContactNameInput(e) {
    this.setData({ contactName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value.replace(/\D/g, '') })
  },

  onPinTopChange(e) {
    const pinTop = e.detail.value
    this.setData({
      pinTop,
      pinScanned: pinTop ? this.data.pinScanned : false
    })
  },

  onScanPinQr() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode'],
      success: () => {
        this.setData({ pinScanned: true })
        wx.showToast({ title: '扫码成功', icon: 'success' })
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') > -1) return
        wx.showToast({ title: '扫码失败，请重试', icon: 'none' })
      }
    })
  },

  validatePhone(phone) {
    return /^1\d{10}$/.test(phone)
  },

  onSubmit() {
    const {
      categories,
      categoryIndex,
      regionConfirmed,
      province,
      city,
      regionText,
      content,
      contactName,
      phone,
      pinTop,
      pinScanned,
      regionCode
    } = this.data

    if (categoryIndex <= 0 || !categories[categoryIndex].id) {
      wx.showToast({ title: '请选择发布模块', icon: 'none' })
      return
    }
    if (!regionConfirmed || !regionText) {
      wx.showToast({ title: '请选择地方区域（到城市）', icon: 'none' })
      return
    }
    if (!content.trim()) {
      wx.showToast({ title: '请填写发布信息', icon: 'none' })
      return
    }
    if (!contactName.trim()) {
      wx.showToast({ title: '请填写联系人', icon: 'none' })
      return
    }
    if (!this.validatePhone(phone)) {
      wx.showToast({ title: '请填写正确的11位手机号', icon: 'none' })
      return
    }
    if (pinTop && !pinScanned) {
      wx.showToast({ title: '开启置顶请先扫描二维码', icon: 'none' })
      return
    }

    const category = categories[categoryIndex]
    const payload = {
      categoryId: category.id,
      categoryName: category.name,
      province,
      city,
      region: regionText,
      regionCode,
      content: content.trim(),
      contactName: contactName.trim(),
      phone,
      pinTop
    }

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中' })

    createPost(payload)
      .then(() => {
        wx.hideLoading()
        this.setData({
          submitting: false,
          content: '',
          contactName: '',
          phone: '',
          pinTop: false,
          pinScanned: false
        })
        wx.showToast({ title: '发布成功', icon: 'success' })
        setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 800)
      })
      .catch((err) => {
        wx.hideLoading()
        this.setData({ submitting: false })
        wx.showToast({
          title: err.message || '发布失败，请检查云开发',
          icon: 'none'
        })
      })
  }
})
