/** 后端 API 根地址，上线前请替换为正式域名并在微信公众平台配置 request 合法域名 */
const API_BASE = 'https://your-api.example.com'

/** 云开发环境 ID（微信云开发控制台复制） */
const CLOUD_ENV_ID = 'cloud1-d0gm1rj75aff9d19f'

/** 会员套餐 */
const MEMBERSHIP_PLANS = [
  { id: 'month', name: '月卡会员', months: 1, price: 29, desc: '30天专属特权' },
  { id: 'half', name: '半年会员', months: 6, price: 149, desc: '180天更划算' },
  { id: 'year', name: '年度会员', months: 12, price: 268, desc: '365天尊享服务' }
]

/** 站点名称 */
const SITE_NAME = '金鸡包子信息网'

/** 发布页「信息置顶」展示的二维码图片路径（替换为运营二维码） */
const PIN_QR_IMAGE = '/images/pin-qr-placeholder.png'

/** 首页轮播图（3 张，可替换为设计稿） */
const HOME_BANNERS = [
  '/images/banner/banner1.png',
  '/images/banner/banner2.png',
  '/images/banner/banner3.png'
]

/** 首页快捷分类（参考同业布局） */
const HOME_CATEGORIES = [
  { id: 'job', name: '求职招聘', icon: '👔' },
  { id: 'shop', name: '转店找店', icon: '🏪' },
  { id: 'second', name: '二手买卖', icon: '🛒' },
  { id: 'train', name: '技术培训', icon: '📚' },
  { id: 'ad', name: '商家广告', icon: '📢' },
  { id: 'join', name: '招商加盟', icon: '🤝' },
  { id: 'carpool', name: '顺风车', icon: '🚗' },
  { id: 'other', name: '其它需求', icon: '📋' }
]

/** 同城信息分类（分类页） */
const CATEGORIES = HOME_CATEGORIES

/** 统计初始值（从 0 起计，之后由访问/发布累加） */
const STATS_INIT = {
  views: 0,
  posts: 0,
  users: 0
}

module.exports = {
  API_BASE,
  CLOUD_ENV_ID,
  SITE_NAME,
  PIN_QR_IMAGE,
  HOME_BANNERS,
  HOME_CATEGORIES,
  CATEGORIES,
  STATS_INIT,
  MEMBERSHIP_PLANS
}
