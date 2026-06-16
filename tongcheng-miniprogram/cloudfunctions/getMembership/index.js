const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const PLANS = {
  month: { name: '月卡会员', months: 1, price: 29 },
  half: { name: '半年会员', months: 6, price: 149 },
  year: { name: '年度会员', months: 12, price: 268 }
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { membership: null }

  const res = await db
    .collection('memberships')
    .where({ openid: OPENID })
    .orderBy('expireAt', 'desc')
    .limit(1)
    .get()

  const doc = res.data && res.data[0]
  if (!doc) return { membership: null }

  const expireAt = doc.expireAt
  const expireMs = expireAt instanceof Date ? expireAt.getTime() : expireAt
  if (expireMs <= Date.now()) return { membership: null }

  return { membership: doc }
}
