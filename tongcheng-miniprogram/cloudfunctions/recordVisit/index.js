const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

const STATS_DOC_ID = 'global'

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const incPosts = event && event.incPosts

  const statsCol = db.collection('platform_stats')
  const usersCol = db.collection('wechat_users')

  let statsRes = await statsCol.doc(STATS_DOC_ID).get().catch(() => null)

  if (!statsRes || !statsRes.data) {
    await statsCol.doc(STATS_DOC_ID).set({
      data: { views: 0, posts: 0, users: 0 }
    })
    statsRes = { data: { views: 0, posts: 0, users: 0 } }
  }

  if (incPosts) {
    await statsCol.doc(STATS_DOC_ID).update({
      data: { posts: _.inc(1) }
    })
  } else if (OPENID) {
    await statsCol.doc(STATS_DOC_ID).update({
      data: { views: _.inc(1) }
    })

    const userDoc = await usersCol.doc(OPENID).get().catch(() => null)
    if (!userDoc || !userDoc.data) {
      await usersCol.doc(OPENID).set({
        data: { openid: OPENID, createdAt: db.serverDate() }
      })
      await statsCol.doc(STATS_DOC_ID).update({
        data: { users: _.inc(1) }
      })
    }
  }

  const latest = await statsCol.doc(STATS_DOC_ID).get()
  return { stats: latest.data }
}
