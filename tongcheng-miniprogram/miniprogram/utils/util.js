const formatNumber = (n) => {
  const s = n.toString()
  return s[1] ? s : `0${s}`
}

const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute].map(formatNumber).join(':')}`
}

const formatRelativeTime = (timestamp) => {
  const diff = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  return formatTime(timestamp)
}

module.exports = {
  formatTime,
  formatRelativeTime
}
