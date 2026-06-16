const { API_BASE, CLOUD_ENV_ID, STATS_INIT } = require('../config/index')
const { request } = require('../utils/request')
const { formatStatWan } = require('../utils/format')

const STORAGE_STATS = 'platform_stats'
const STORAGE_STATS_VERSION = 'platform_stats_data_version'
const STORAGE_OPENID = 'wx_openid'
const STORAGE_USER_REGISTRY = 'platform_wechat_users'
/** 本地统计数据结构版本，变更后会对本地缓存执行一次清零 */
const STATS_DATA_VERSION = 1

const defaultStats = () => ({
  views: STATS_INIT.views,
  posts: STATS_INIT.posts,
  users: STATS_INIT.users
})

const readLocalStats = () => {
  const cached = wx.getStorageSync(STORAGE_STATS)
  if (cached && typeof cached.views === 'number') return cached
  const init = defaultStats()
  wx.setStorageSync(STORAGE_STATS, init)
  return init
}

const writeLocalStats = (stats) => {
  wx.setStorageSync(STORAGE_STATS, stats)
}

const toDisplayStats = (raw) => ({
  views: raw.views,
  posts: raw.posts,
  users: raw.users,
  viewsText: formatStatWan(raw.views),
  postsText: formatStatWan(raw.posts),
  usersText: formatStatWan(raw.users)
})

/** 云开发：记录一次访问（浏览+1，按 openid 去重累计用户） */
const recordVisitByCloud = () =>
  new Promise((resolve, reject) => {
    if (!wx.cloud || !CLOUD_ENV_ID) {
      reject(new Error('cloud not configured'))
      return
    }
    wx.cloud
      .callFunction({ name: 'recordVisit' })
      .then((res) => {
        const stats = res.result && res.result.stats
        if (stats) {
          writeLocalStats(stats)
          resolve(toDisplayStats(stats))
        } else {
          reject(new Error('invalid cloud response'))
        }
      })
      .catch(reject)
  })

/** 后端：记录访问 */
const recordVisitByApi = (code) =>
  request({
    url: '/api/stats/visit',
    method: 'POST',
    data: { code }
  }).then((data) => {
    const stats = data.stats || data
    writeLocalStats(stats)
    if (data.openid) wx.setStorageSync(STORAGE_OPENID, data.openid)
    return toDisplayStats(stats)
  })

/**
 * 本地回退：每次进入首页浏览+1；用 wx.login + openid 缓存对微信用户去重
 * 说明：真机多用户统计需云开发或后端换取 openid，本地模式仅适合开发调试
 */
const recordVisitLocal = () =>
  new Promise((resolve) => {
    const stats = readLocalStats()
    stats.views += 1

    let openid = wx.getStorageSync(STORAGE_OPENID)
    if (!openid) {
      openid = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      wx.setStorageSync(STORAGE_OPENID, openid)
    }

    const registry = wx.getStorageSync(STORAGE_USER_REGISTRY) || []
    if (!registry.includes(openid)) {
      registry.push(openid)
      wx.setStorageSync(STORAGE_USER_REGISTRY, registry)
      stats.users += 1
    }

    writeLocalStats(stats)
    resolve(toDisplayStats(stats))
  })

const recordPageVisit = () =>
  new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        const code = loginRes.code
        if (CLOUD_ENV_ID && wx.cloud) {
          recordVisitByCloud().then(resolve).catch(() => {
            recordVisitLocal().then(resolve)
          })
          return
        }
        if (API_BASE && !API_BASE.includes('example.com')) {
          recordVisitByApi(code).then(resolve).catch(() => {
            recordVisitLocal().then(resolve)
          })
          return
        }
        recordVisitLocal().then(resolve)
      },
      fail: () => {
        recordVisitLocal().then(resolve)
      }
    })
  })

const getStats = () => toDisplayStats(readLocalStats())

const incrementPostCount = (delta = 1) => {
  const stats = readLocalStats()
  stats.posts += delta
  writeLocalStats(stats)
  return toDisplayStats(stats)
}

/** 清零浏览/发布/用户本地缓存，恢复为 STATS_INIT */
const resetStats = () => {
  wx.removeStorageSync(STORAGE_USER_REGISTRY)
  wx.removeStorageSync(STORAGE_OPENID)
  const stats = defaultStats()
  writeLocalStats(stats)
  return toDisplayStats(stats)
}

/** 版本升级时自动清零一次，避免沿用旧的演示数据 */
const resetStatsIfNeeded = () => {
  const v = wx.getStorageSync(STORAGE_STATS_VERSION)
  if (v === STATS_DATA_VERSION) return getStats()
  resetStats()
  wx.setStorageSync(STORAGE_STATS_VERSION, STATS_DATA_VERSION)
  return getStats()
}

module.exports = {
  recordPageVisit,
  getStats,
  incrementPostCount,
  resetStats,
  resetStatsIfNeeded,
  toDisplayStats
}
