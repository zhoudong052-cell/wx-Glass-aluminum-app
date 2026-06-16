const { fetchMyPosts } = require('../../services/post')

Page({
  data: {
    list: [],
    loading: true
  },

  onShow() {
    this.setData({ loading: true })
    fetchMyPosts()
      .then((list) => this.setData({ list, loading: false }))
      .catch(() => this.setData({ list: [], loading: false }))
  }
})
