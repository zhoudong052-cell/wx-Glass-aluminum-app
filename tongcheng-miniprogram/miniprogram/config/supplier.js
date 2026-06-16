/** 供应商页轮播（2 张） */
const SUPPLIER_BANNERS = [
  '/images/banner/banner1.png',
  '/images/banner/banner2.png'
]

/** 供应商四大模块 */
const SUPPLIER_MODULES = [
  { id: 'material', name: '材料供应', icon: '🧱' },
  { id: 'equipment', name: '设备机器', icon: '⚙️' },
  { id: 'parts', name: '配件供应', icon: '🔩' },
  { id: 'join', name: '商家入驻', icon: '🏪', link: true }
]

/** 商家入驻可选商品分类 */
const MERCHANT_CATEGORIES = [
  { id: 'material', name: '材料供应' },
  { id: 'equipment', name: '设备机器' },
  { id: 'parts', name: '配件供应' }
]

/** 列表标签 */
const SUPPLIER_TABS = [
  { id: 'recommend', name: '推荐' },
  { id: 'new', name: '新入' },
  { id: 'nearby', name: '附近' }
]

/** 商圈公告默认入驻厂商（可被本地入驻数据追加） */
const DEFAULT_VENDOR_NAMES = [
  '鑫达铝材商行',
  '宏业玻璃配件',
  '永盛机械设备',
  '汇通材料批发'
]

module.exports = {
  SUPPLIER_BANNERS,
  SUPPLIER_MODULES,
  MERCHANT_CATEGORIES,
  SUPPLIER_TABS,
  DEFAULT_VENDOR_NAMES
}
