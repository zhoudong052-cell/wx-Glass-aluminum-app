const STORAGE_KEY = 'platform_merchants'

const MOCK_MERCHANTS = [
  {
    id: 'm1',
    shopName: '鑫达铝材商行',
    categoryId: 'material',
    categoryName: '材料供应',
    phone: '13800001111',
    intro: '铝合金型材、板材批发，同城配送',
    tags: ['recommend', 'nearby'],
    distance: '1.2km',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'm2',
    shopName: '宏业玻璃配件',
    categoryId: 'parts',
    categoryName: '配件供应',
    phone: '13800002222',
    intro: '玻璃胶条、五金配件齐全',
    tags: ['recommend', 'new'],
    distance: '2.5km',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'm3',
    shopName: '永盛机械设备',
    categoryId: 'equipment',
    categoryName: '设备机器',
    phone: '13800003333',
    intro: '切割机、磨边机销售与维修',
    tags: ['new', 'nearby'],
    distance: '0.8km',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'm4',
    shopName: '汇通材料批发',
    categoryId: 'material',
    categoryName: '材料供应',
    phone: '13800004444',
    intro: '各类建材一站式采购',
    tags: ['recommend'],
    distance: '3.1km',
    createdAt: Date.now() - 86400000 * 15
  }
]

const readStored = () => {
  try {
    return wx.getStorageSync(STORAGE_KEY) || []
  } catch (e) {
    return []
  }
}

const getAllMerchants = () => {
  const stored = readStored()
  const ids = new Set(stored.map((m) => m.id))
  const merged = [...stored, ...MOCK_MERCHANTS.filter((m) => !ids.has(m.id))]
  return merged.sort((a, b) => b.createdAt - a.createdAt)
}

const saveMerchant = (data) => {
  const list = readStored()
  const item = {
    id: `local_${Date.now()}`,
    ...data,
    tags: ['new', 'nearby'],
    distance: '本城',
    createdAt: Date.now()
  }
  list.unshift(item)
  wx.setStorageSync(STORAGE_KEY, list)
  return item
}

const getVendorNames = () => {
  const names = getAllMerchants().map((m) => m.shopName)
  return names.length ? names : require('../config/supplier').DEFAULT_VENDOR_NAMES
}

const filterMerchants = ({ tab, moduleId }) => {
  let list = getAllMerchants()
  if (moduleId && moduleId !== 'join') {
    list = list.filter((m) => m.categoryId === moduleId)
  }
  if (tab === 'recommend') {
    list = list.filter((m) => m.tags && m.tags.includes('recommend'))
  } else if (tab === 'new') {
    list = list.filter((m) => m.tags && m.tags.includes('new'))
  } else if (tab === 'nearby') {
    list = list.filter((m) => m.tags && m.tags.includes('nearby'))
  }
  if (!list.length) list = getAllMerchants().slice(0, 3)
  return list
}

module.exports = {
  getAllMerchants,
  saveMerchant,
  getVendorNames,
  filterMerchants
}
