/**
 * 置顶帖排在最前；多条置顶按小时轮播，每小时切换第一条置顶
 */
const sortPostsWithPinRotation = (list) => {
  if (!list || !list.length) return []

  const pinned = list
    .filter((p) => p.pinTop)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  const normal = list
    .filter((p) => !p.pinTop)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  if (!pinned.length) return normal

  const hourSlot = Math.floor(Date.now() / (3600 * 1000))
  const start = hourSlot % pinned.length
  const rotated = [...pinned.slice(start), ...pinned.slice(0, start)]
  return [...rotated, ...normal]
}

const buildTitleSummary = (content) => {
  const text = (content || '').trim()
  const line = text.split('\n')[0] || text
  return {
    title: line.slice(0, 40) || '同城信息',
    summary: text.slice(0, 120)
  }
}

module.exports = {
  sortPostsWithPinRotation,
  buildTitleSummary
}
