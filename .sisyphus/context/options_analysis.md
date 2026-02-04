# 表单选项差异化分析

## 需要中英文差异化的选项（核心需求）

### 1. 通讯平台选项 (contact-list.contact.platform)

**位置**: Section `emergency-contacts` > Category `contact-list` > Item `contact` > Field `platform`

#### 当前选项
```typescript
options: [
  { value: 'imessage', label: 'iMessages' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'skype', label: 'Skype' },
  { value: 'discord', label: 'Discord' },
  { value: 'google-chat', label: 'Google Chat' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'email', label: 'Email' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'other', label: '其他' }
]
```

#### 建议差异化方案

**中文版 (zh-CN):**
```typescript
options: [
  { value: 'wechat', label: '微信' },           // 新增
  { value: 'qq', label: 'QQ' },                 // 新增
  { value: 'weibo', label: '微博' },            // 新增
  { value: 'dingtalk', label: '钉钉' },         // 新增
  { value: 'feishu', label: '飞书' },           // 新增
  { value: 'imessage', label: 'iMessage' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: '邮件' },
  { value: 'phone', label: '电话' },            // 新增
  { value: 'sms', label: '短信' },              // 新增
  { value: 'other', label: '其他' }
]
```

**英文版 (en-US):**
```typescript
options: [
  { value: 'imessage', label: 'iMessage' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook Messenger' },
  { value: 'discord', label: 'Discord' },
  { value: 'google-chat', label: 'Google Chat' },
  { value: 'instagram', label: 'Instagram DM' },
  { value: 'twitter', label: 'Twitter/X DM' },
  { value: 'skype', label: 'Skype' },
  { value: 'telegram', label: 'Telegram' },      // 新增
  { value: 'signal', label: 'Signal' },          // 新增
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'other', label: 'Other' }
]
```

---

### 2. 社交媒体平台选项 (social-media.social-account.platform)

**位置**: Section `tech` > Category `social-media` > Item `social-account` > Field `platform`

#### 当前选项
```typescript
options: [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: '其他' }
]
```

#### 建议差异化方案

**中文版 (zh-CN):**
```typescript
options: [
  { value: 'wechat', label: '微信' },
  { value: 'weibo', label: '微博' },
  { value: 'xiaohongshu', label: '小红书' },
  { value: 'douyin', label: '抖音' },
  { value: 'bilibili', label: 'B站 (哔哩哔哩)' },
  { value: 'zhihu', label: '知乎' },
  { value: 'douban', label: '豆瓣' },
  { value: 'tiktok', label: 'TikTok (海外版抖音)' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'other', label: '其他' }
]
```

**英文版 (en-US):**
```typescript
options: [
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'threads', label: 'Threads' },        // 新增
  { value: 'mastodon', label: 'Mastodon' },      // 新增  
  { value: 'bluesky', label: 'Bluesky' },        // 新增
  { value: 'github', label: 'GitHub' },
  { value: 'pinterest', label: 'Pinterest' },   // 新增
  { value: 'snapchat', label: 'Snapchat' },     // 新增
  { value: 'other', label: 'Other' }
]
```

---

### 3. 社交媒体账户处理方式 (social-media.social-account.action)

**位置**: Section `tech` > Category `social-media` > Item `social-account` > Field `action`

#### 当前选项
```typescript
options: [
  { value: 'keep', label: '保留' },
  { value: 'close', label: '关闭' },
  { value: 'export-close', label: '导出数据后关闭' },
  { value: 'sell', label: '出售（如果值得）' },
  { value: 'memorial', label: '转为纪念账户' }
]
```

#### 建议差异化方案

**中文版**: 保持现有选项

**英文版**:
```typescript
options: [
  { value: 'keep', label: 'Keep Active' },
  { value: 'close', label: 'Close/Delete' },
  { value: 'export-close', label: 'Export Data & Close' },
  { value: 'sell', label: 'Sell (if valuable)' },
  { value: 'memorial', label: 'Convert to Memorial' }
]
```

---

### 4. 安全问题选项 (security-questions.security-question.question)

**位置**: Section `misc` > Category `security-questions` > Item `security-question` > Field `question`

#### 当前选项
```typescript
options: [
  { value: 'first-pet', label: '第一只宠物的名字' },
  { value: 'fathers-middle-name', label: '父亲的中间名' },
  { value: 'mothers-maiden-name', label: '母亲的婚前姓' },
  { value: 'childhood-street', label: '童年时住的街道' },
  { value: 'first-car', label: '第一辆车' },
  { value: 'first-school', label: '第一所学校' },
  { value: 'custom', label: '自定义问题' }
]
```

#### 建议差异化方案

**说明**: 安全问题在不同文化背景下常见的问题有所不同

**中文版 (zh-CN):**
```typescript
options: [
  { value: 'first-pet', label: '第一只宠物的名字' },
  { value: 'mothers-maiden-name', label: '母亲的婚前姓' },
  { value: 'childhood-city', label: '出生城市' },        // 调整
  { value: 'first-school', label: '小学名称' },          // 调整
  { value: 'favorite-teacher', label: '最喜欢的老师姓名' }, // 新增
  { value: 'best-friend', label: '最好朋友的名字' },      // 新增
  { value: 'custom', label: '自定义问题' }
]
```

**英文版 (en-US):**
```typescript
options: [
  { value: 'first-pet', label: "What was your first pet's name?" },
  { value: 'fathers-middle-name', label: "What is your father's middle name?" },
  { value: 'mothers-maiden-name', label: "What is your mother's maiden name?" },
  { value: 'childhood-street', label: "What street did you grow up on?" },
  { value: 'first-car', label: "What was your first car?" },
  { value: 'first-school', label: "What was the name of your first school?" },
  { value: 'childhood-nickname', label: "What was your childhood nickname?" },
  { value: 'custom', label: 'Custom Question' }
]
```

---

## 仅需翻译的选项（无需差异化）

以下选项在两种语言中含义相同，只需翻译 label 即可：

| 选项组 | value 值 | zh-CN | en-US |
|--------|----------|-------|-------|
| 域名处理 (action) | keep | 保留并继续付费 | Keep & Continue Paying |
| | transfer | 转让给他人 | Transfer to Someone |
| | cancel | 取消/不续费 | Cancel / Don't Renew |
| 订阅处理 (action) | keep | 保留 | Keep |
| | cancel | 取消 | Cancel |
| | transfer | 转让 | Transfer |
| 设备类型 | server | 服务器 | Server |
| | computer | 电脑 | Desktop Computer |
| | laptop | 笔记本 | Laptop |
| | phone | 手机 | Phone |
| | tablet | 平板 | Tablet |
| | nas | NAS 存储 | NAS Storage |
| | other | 其他 | Other |
| IoT设备类型 | lighting | 智能灯光 | Smart Lighting |
| | speaker | 智能音箱 | Smart Speaker |
| | streaming | 流媒体设备 | Streaming Device |
| | vacuum | 扫地机器人 | Robot Vacuum |
| | air-purifier | 空气净化器 | Air Purifier |
| | camera | 摄像头 | Security Camera |
| | smart-plug | 智能插座 | Smart Plug |
| | thermostat | 智能温控 | Smart Thermostat |
| | other | 其他 | Other |
| 云服务处理 (action) | keep | 保留 | Keep |
| | cancel | 取消 | Cancel |
| | transfer | 转移资源 | Transfer Resources |
| | contact-support | 联系支持处理 | Contact Support |
| 银行账户类型 | checking | 支票账户 | Checking Account |
| | savings | 储蓄账户 | Savings Account |
| | both | 两者都有 | Both |
| 服务类型 | mobile | 手机 | Mobile |
| | internet | 网络 | Internet |
| | bundle | 套餐 | Bundle |
| 支付类型 | auto-charge | 自动扣款（收款方扣款） | Auto-charge (Payee Initiated) |
| | recurring-bill-pay | 定期账单支付（银行发起） | Recurring Bill Pay (Bank Initiated) |
| 密码类型 | pin | PIN 码 | PIN Code |
| | combination | 组合锁 | Combination Lock |
| | key-location | 钥匙位置 | Key Location |
| | other | 其他 | Other |

---

## 技术实现方案

### 方案一：选项列表在翻译文件中定义

```json
// zh-CN.json
{
  "checklist": {
    "options": {
      "platforms": {
        "messaging": [
          { "value": "wechat", "label": "微信" },
          { "value": "qq", "label": "QQ" },
          ...
        ],
        "social": [
          { "value": "wechat", "label": "微信" },
          { "value": "weibo", "label": "微博" },
          ...
        ]
      }
    }
  }
}
```

**优点**: 完全分离，灵活度高
**缺点**: 翻译文件会变得很大

### 方案二：选项工厂函数

```typescript
// src/data/options.ts
export function getPlatformOptions(lang: string) {
  const base = [...]; // 通用选项
  const zhOnly = [...]; // 仅中文选项
  const enOnly = [...]; // 仅英文选项
  
  if (lang.startsWith('zh')) {
    return [...zhOnly, ...base];
  }
  return [...enOnly, ...base];
}
```

**优点**: 代码集中管理，易于维护
**缺点**: 需要在运行时调用

### 方案三：混合方案（推荐）

1. 通用选项的 label 使用 i18n key
2. 语言特定选项在单独的配置中定义
3. 组件动态合并选项

```typescript
// checklistStructure.ts
{
  id: 'platform',
  label: 'fields.platform.label', // i18n key
  type: 'select',
  optionsKey: 'messaging-platforms' // 引用选项配置
}

// src/data/platformOptions.ts
export const messagingPlatforms = {
  common: [
    { value: 'email', labelKey: 'options.email' },
    { value: 'other', labelKey: 'options.other' }
  ],
  'zh-CN': [
    { value: 'wechat', label: '微信' },
    { value: 'qq', label: 'QQ' }
  ],
  'en-US': [
    { value: 'imessage', label: 'iMessage' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ]
};
```

---

## 下一步

在 task-003（架构设计）中确定最终方案，需要考虑：

1. 翻译文件的组织结构
2. 选项差异化的技术实现
3. 运行时动态获取结构的方式
4. 对现有组件的影响
