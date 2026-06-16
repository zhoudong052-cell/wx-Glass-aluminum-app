const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { list: [] }

  const res = await db
    .collection('posts')
    .where({ _openid: OPENID })
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()

  return { list: res.data || [] }
}
