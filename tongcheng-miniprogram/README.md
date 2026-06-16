# 同城生活 · 微信小程序

符合[微信小程序官方目录规范](https://developers.weixin.qq.com/miniprogram/dev/framework/structure.html)的同城信息小程序脚手架。

## 目录结构

```
tongcheng-miniprogram/
├── project.config.json      # 项目配置（含 miniprogramRoot）
├── sitemap.json
├── README.md
└── miniprogram/             # 小程序源码根目录
    ├── app.js / app.json / app.wxss
    ├── sitemap.json
    ├── config/              # 常量与分类配置
    ├── utils/               # 工具与网络请求
    ├── services/            # 业务 API 封装
    ├── components/          # 自定义组件
    ├── pages/               # 页面（每页四件套 js/json/wxml/wxss）
    │   ├── index/           # 首页
    │   ├── category/        # 分类
    │   ├── publish/         # 发布
    │   ├── detail/          # 详情
    │   ├── message/         # 消息
    │   └── mine/            # 我的
    └── images/              # 图片与 tabBar 图标
```

## 快速开始

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入本项目目录 `tongcheng-miniprogram`
3. 在 `project.config.json` 中将 `appid` 改为你的小程序 AppID
4. 在 `miniprogram/config/index.js` 中配置后端 `API_BASE`
5. 编译预览

## 首页统计（浏览 / 发布 / 用户）

- **浏览**：每次进入首页 `onShow` 自动 +1（变量 `stats.views` / `stats.viewsText`）
- **发布**：用户发布成功时 +1（`services/stats.js` → `incrementPostCount`）
- **用户**：按微信账号去重
  - **推荐**：开通[云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)，在 `miniprogram/config/index.js` 填写 `CLOUD_ENV_ID`，上传云函数 `cloudfunctions/recordVisit`（使用 `OPENID` 去重）
  - **或**：对接后端 `POST /api/stats/visit`，用 `code` 换 `openid` 后统计
  - 未配置时走本地缓存（仅适合开发调试）

## 云开发（信息发布 + 会员）

环境 ID 配置在 `miniprogram/config/index.js` → `CLOUD_ENV_ID`。

### 云数据库集合

| 集合 | 说明 |
|------|------|
| `posts` | 用户发布的信息（分类、地区、内容、置顶等） |
| `memberships` | 会员开通记录（金额、开通时间、到期时间） |
| `platform_stats` | 全局统计文档 `global` |
| `wechat_users` | 用户去重统计 |

**建议索引：** `posts` 按 `createdAt` 降序；按 `categoryId + createdAt` 组合索引。`memberships` 按 `openid + expireAt`。

### 云函数（右键上传并部署）

- `recordVisit` — 浏览/用户统计，发布时 `incPosts: 1` 增加发布数
- `getMembership` / `purchaseMembership` — 会员查询与开通
- `getMyPosts` — 我的发布列表

### 列表排序规则

- 置顶信息始终在列表最前
- 多条置顶按**小时轮播**：每小时切换哪条置顶排第一位
- 其余信息按发布时间倒序
- 首页「最新信息」显示全部；点击分类 Tab 或分类页入口按 `categoryId` 筛选

### 会员套餐

月卡会员 / 半年会员 / 年度会员 — 在「我的 → 会员中心」开通，数据写入 `memberships`。

## TabBar 图标

`app.json` 引用了 `miniprogram/images/tab-*.png`（建议 81×81px）。当前为占位图，可在设计稿导出后替换同名文件。

## 上线 checklist

- [ ] 配置合法 request 域名
- [ ] 用户隐私保护指引与 `requiredPrivateInfos`
- [ ] 内容安全（文本/图片审核接口）
- [ ] 替换 `touristappid` 为正式 AppID
