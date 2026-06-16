const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const PLANS = {
  month: { name: '月卡会员', months: 1, price: 29 },
  half: { name: '半年会员', months: 6, price: 149 },
  year: { name: '年度会员', months: 12, price: 268 }
}

const addMonths = (ts, months) => {
  const d = new Date(ts)
  d.setMonth(d.getMonth() + months)
  return d.getTime()
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const planId = event && event.planId
  const plan = PLANS[planId]

  if (!OPENID) return { errMsg: '未登录' }
  if (!plan) return { errMsg: '会员类型无效' }

  const now = Date.now()
  const col = db.collection('memberships')

  const exist = await col
    .where({ openid: OPENID })
    .orderBy('expireAt', 'desc')
    .limit(1)
    .get()

  let base = now
  const prev = exist.data && exist.data[0]
  let prevExpire = 0
  if (prev) {
    prevExpire = prev.expireAt instanceof Date ? prev.expireAt.getTime() : prev.expireAt
    if (prevExpire > now) base = prevExpire
  }

  const startAt = prev && prevExpire > now ? prev.startAt || now : now
  const expireAt = addMonths(base, plan.months)

  const data = {
    openid: OPENID,
    planId,
    planName: plan.name,
    amount: plan.price,
    startAt,
    expireAt,
    createdAt: now,
    updatedAt: now
  }

  if (prev && prev._id) {
    await col.doc(prev._id).update({ data })
    const updated = await col.doc(prev._id).get()
    return { membership: updated.data }
  }

  const addRes = await col.add({ data })
  const doc = await col.doc(addRes._id).get()
  return { membership: doc.data }
}
