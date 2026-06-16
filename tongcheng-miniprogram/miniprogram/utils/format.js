/** 将数字格式化为「万」展示，如 24060000 -> 2406万 */
const formatStatWan = (num) => {
  const n = Number(num) || 0
  if (n >= 10000) {
    const wan = n / 10000
    if (wan >= 100) return `${Math.round(wan)}万`
    const text = wan.toFixed(2).replace(/\.?0+$/, '')
    return `${text}万`
  }
  return String(n)
}

module.exports = {
  formatStatWan
}
