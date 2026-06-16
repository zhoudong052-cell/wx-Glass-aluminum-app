const { formatRelativeTime } = require('../../utils/util')

Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  data: {
    timeText: ''
  },

  observers: {
    item(val) {
      if (val && val.createdAt) {
        this.setData({ timeText: formatRelativeTime(val.createdAt) })
      }
    }
  },

  methods: {
    onTap() {
      const { id } = this.properties.item
      if (!id) return
      wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
    }
  }
})
