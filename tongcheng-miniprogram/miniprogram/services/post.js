const { isCloudEnabled, getDb } = require('../utils/cloud')
const { sortPostsWithPinRotation, buildTitleSummary } = require('../utils/postSort')

const COLLECTION = 'posts'

const formatPostDoc = (doc) => {
  const createdAt =
    typeof doc.createdAt === 'number'
      ? doc.createdAt
      : doc.createdAt
        ? new Date(doc.createdAt).getTime()
        : Date.now()

  return {
    id: doc._id,
    _id: doc._id,
    categoryId: doc.categoryId,
    categoryName: doc.categoryName,
    title: doc.title,
    summary: doc.summary,
    content: doc.content,
    province: doc.province,
    city: doc.city || doc.region,
    district: doc.city || '',
    region: doc.region,
    contactName: doc.contactName,
    phone: doc.phone,
    pinTop: !!doc.pinTop,
    price: doc.price || '',
    createdAt
  }
}

/** 发布信息到云数据库 */
const createPost = (payload) => {
  if (!isCloudEnabled()) {
    return Promise.reject(new Error('未配置云开发'))
  }

  const db = getDb()
  const { title, summary } = buildTitleSummary(payload.content)
  const now = Date.now()

  return db
    .collection(COLLECTION)
    .add({
      data: {
        categoryId: payload.categoryId,
        categoryName: payload.categoryName,
        province: payload.province,
        city: payload.city,
        region: payload.region,
        regionCode: payload.regionCode || [],
        content: payload.content,
        title,
        summary,
        contactName: payload.contactName,
        phone: payload.phone,
        pinTop: !!payload.pinTop,
        price: payload.price || '',
        createdAt: now
      }
    })
    .then((res) => {
      incrementCloudPostCount()
      return { id: res._id, createdAt: now, ...payload, title, summary }
    })
}

const incrementCloudPostCount = () => {
  if (!isCloudEnabled()) return
  wx.cloud
    .callFunction({ name: 'recordVisit', data: { incPosts: 1 } })
    .catch(() => {})
}

/** 查询列表：按分类/标签筛选，置顶+时间排序 */
const fetchPostList = (options = {}) => {
  const { categoryId, tab, keyword, city, limit = 50 } = options

  if (!isCloudEnabled()) {
    return Promise.resolve([])
  }

  const db = getDb()
  let query = db.collection(COLLECTION)

  const buildWhere = () => {
    const cond = {}
    if (categoryId && categoryId !== 'latest' && categoryId !== 'nearby') {
      cond.categoryId = categoryId
    }
    if (tab && tab !== 'latest' && tab !== 'nearby') {
      cond.categoryId = tab
    }
    if ((tab === 'nearby' || categoryId === 'nearby') && city && city !== '本地') {
      cond.city = city
    }
    return cond
  }

  const where = buildWhere()

  const runQuery = (q) =>
    q
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()
      .then((res) => {
        let list = (res.data || []).map(formatPostDoc)
        if (keyword && keyword.trim()) {
          const kw = keyword.trim().toLowerCase()
          list = list.filter(
            (p) =>
              (p.title && p.title.toLowerCase().includes(kw)) ||
              (p.content && p.content.toLowerCase().includes(kw)) ||
              (p.categoryName && p.categoryName.includes(kw))
          )
        }
        return sortPostsWithPinRotation(list)
      })

  if (Object.keys(where).length) {
    return runQuery(query.where(where))
  }
  return runQuery(query)
}

const fetchPostDetail = (id) => {
  if (!isCloudEnabled() || !id) {
    return Promise.reject(new Error('无效的信息 ID'))
  }
  return getDb()
    .collection(COLLECTION)
    .doc(id)
    .get()
    .then((res) => {
      if (!res.data) throw new Error('信息不存在')
      return formatPostDoc(res.data)
    })
}

const fetchMyPosts = () => {
  if (!isCloudEnabled()) return Promise.resolve([])
  return wx.cloud
    .callFunction({ name: 'getMyPosts' })
    .then((res) => {
      const list = (res.result && res.result.list) || []
      return sortPostsWithPinRotation(list.map(formatPostDoc))
    })
    .catch(() => [])
}

module.exports = {
  createPost,
  fetchPostList,
  fetchPostDetail,
  fetchMyPosts,
  formatPostDoc
}
