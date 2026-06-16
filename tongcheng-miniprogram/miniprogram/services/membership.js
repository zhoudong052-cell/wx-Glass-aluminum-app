const { MEMBERSHIP_PLANS } = require('../config/index')
const { isCloudEnabled, getDb } = require('../utils/cloud')

const COLLECTION = 'memberships'

const getPlanById = (planId) => MEMBERSHIP_PLANS.find((p) => p.id === planId)

const addMonths = (timestamp, months) => {
  const d = new Date(timestamp)
  d.setMonth(d.getMonth() + months)
  return d.getTime()
}

const formatMembership = (doc) => {
  if (!doc) return null
  const expireAt =
    typeof doc.expireAt === 'number' ? doc.expireAt : new Date(doc.expireAt).getTime()
  const startAt =
    typeof doc.startAt === 'number' ? doc.startAt : new Date(doc.startAt).getTime()
  return {
    ...doc,
    id: doc._id,
    expireAt,
    startAt,
    isActive: expireAt > Date.now()
  }
}

/** 查询当前用户有效会员（云函数按 openid） */
const fetchMyMembership = () => {
  if (!isCloudEnabled()) {
    const local = wx.getStorageSync('local_membership')
    return Promise.resolve(local ? formatMembership(local) : null)
  }
  return wx.cloud
    .callFunction({ name: 'getMembership' })
    .then((res) => formatMembership(res.result && res.result.membership))
    .catch(() => null)
}

/** 开通/续费会员 */
const purchaseMembership = (planId) => {
  const plan = getPlanById(planId)
  if (!plan) return Promise.reject(new Error('会员类型无效'))

  if (!isCloudEnabled()) {
    const now = Date.now()
    const local = {
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      startAt: now,
      expireAt: addMonths(now, plan.months),
      createdAt: now
    }
    wx.setStorageSync('local_membership', local)
    return Promise.resolve(formatMembership(local))
  }

  return wx.cloud
    .callFunction({
      name: 'purchaseMembership',
      data: { planId: plan.id }
    })
    .then((res) => {
      if (res.result && res.result.errMsg) {
        return Promise.reject(new Error(res.result.errMsg))
      }
      return formatMembership(res.result && res.result.membership)
    })
}

module.exports = {
  MEMBERSHIP_PLANS,
  fetchMyMembership,
  purchaseMembership,
  getPlanById,
  formatMembership
}
