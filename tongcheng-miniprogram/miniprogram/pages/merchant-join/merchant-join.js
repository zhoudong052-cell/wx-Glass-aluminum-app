const { MERCHANT_CATEGORIES } = require('../../config/supplier')
const { saveMerchant } = require('../../services/merchant')

const MAX_ALBUM = 3

Page({
  data: {
    categories: MERCHANT_CATEGORIES,
    categoryIndex: 0,
    shopName: '',
    phone: '',
    intro: '',
    licenseImage: '',
    albumImages: [],
    submitting: false
  },

  onShopNameInput(e) {
    this.setData({ shopName: e.detail.value })
  },

  onCategoryChange(e) {
    this.setData({ categoryIndex: Number(e.detail.value) })
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value.replace(/\D/g, '') })
  },

  onIntroInput(e) {
    this.setData({ intro: e.detail.value })
  },

  chooseImage(count) {
    return new Promise((resolve, reject) => {
      wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => resolve(res.tempFiles.map((f) => f.tempFilePath)),
        fail: reject
      })
    })
  },

  onChooseLicense() {
    this.chooseImage(1)
      .then((paths) => {
        if (paths[0]) this.setData({ licenseImage: paths[0] })
      })
      .catch(() => {})
  },

  onRemoveLicense() {
    this.setData({ licenseImage: '' })
  },

  onChooseAlbum() {
    const remain = MAX_ALBUM - this.data.albumImages.length
    if (remain <= 0) return
    this.chooseImage(remain)
      .then((paths) => {
        const albumImages = this.data.albumImages.concat(paths).slice(0, MAX_ALBUM)
        this.setData({ albumImages })
      })
      .catch(() => {})
  },

  onRemoveAlbum(e) {
    const { index } = e.currentTarget.dataset
    const albumImages = this.data.albumImages.filter((_, i) => i !== index)
    this.setData({ albumImages })
  },

  validatePhone(phone) {
    return /^1\d{10}$/.test(phone)
  },

  onSubmit() {
    const { shopName, phone, intro, licenseImage, albumImages, categories, categoryIndex } = this.data

    if (!shopName.trim()) {
      wx.showToast({ title: '请填写店铺名称', icon: 'none' })
      return
    }
    if (!this.validatePhone(phone)) {
      wx.showToast({ title: '请填写正确手机号', icon: 'none' })
      return
    }
    if (!intro.trim()) {
      wx.showToast({ title: '请填写店铺介绍', icon: 'none' })
      return
    }
    if (!licenseImage) {
      wx.showToast({ title: '请上传营业执照', icon: 'none' })
      return
    }

    const category = categories[categoryIndex]
    this.setData({ submitting: true })

    saveMerchant({
      shopName: shopName.trim(),
      categoryId: category.id,
      categoryName: category.name,
      phone,
      intro: intro.trim(),
      licenseImage,
      albumImages
    })

    setTimeout(() => {
      this.setData({ submitting: false })
      wx.showToast({ title: '入驻成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 400)
  }
})
