# checklistStructure.ts 结构分析

## 概览

文件位置: `src/data/checklistStructure.ts`
总行数: 1798 行
文件大小: ~58KB

## 结构层级

```
ChecklistStructure
├── Section (5个)
│   ├── id, name, description
│   └── categories[]
│       ├── Category
│       │   ├── id, name, description, helpText
│       │   └── items[]
│       │       ├── ItemDefinition (单项)
│       │       │   ├── id, label, type, placeholder, helpText
│       │       │   ├── sensitive?, required?, repeatable?
│       │       │   └── options[]? (for select type)
│       │       └── ItemDefinition (group 组合项)
│       │           ├── id, label, type='group', helpText
│       │           ├── repeatable?
│       │           └── fields[]
│       │               └── FieldDefinition
│       │                   ├── id, label, type, placeholder, helpText
│       │                   ├── sensitive?, required?
│       │                   └── options[]? (for select type)
```

## 5 个主要 Section

| Section ID | 中文名 | 英文名 | Categories 数量 |
|------------|--------|--------|-----------------|
| emergency-contacts | 紧急联系人 | Emergency Contacts | 2 |
| tech | Tech 技术 | Tech | 15 |
| input | Input 收入 | Input | 5 |
| output | Output 支出 | Output | 4 |
| misc | Misc 杂项 | Misc | 4 |

**总计: 30 个 Categories**

---

## 需要翻译的字段类型

### 1. Section 级别
- `name`: 当前格式为 "中文名 English Name" 混合
- `description`: 当前有中文或英文，不统一

### 2. Category 级别
- `name`: 当前格式为 "English Name 中文名" 混合
- `description`: 中英文混合
- `helpText`: 全中文

### 3. Item/Field 级别
- `label`: 全中文
- `placeholder`: 全中文（带"例如："前缀）
- `helpText`: 全中文
- `options[].label`: **关键** - 当前混合中英文

---

## Select 选项统计 (15处)

### 需要中英文差异化的选项

| 位置 | Field ID | 当前选项 | 需要差异化? |
|------|----------|----------|------------|
| Line 40-52 | platform (通讯平台) | iMessages, WhatsApp, Facebook, Skype, Discord, Google Chat, Instagram, Email, Twitter, 其他 | **是** - 中文版需添加微信、QQ、微博 |
| Line 535-545 | platform (社交媒体) | Twitter/X, Facebook, Instagram, LinkedIn, TikTok, YouTube, Reddit, GitHub, 其他 | **是** - 中文版需添加微信、微博、小红书、抖音、B站 |
| Line 482-492 | device-type (IoT设备) | 智能灯光, 智能音箱, 流媒体设备, 扫地机器人... | **是** - 中英文名称翻译 |

### 仅需翻译的选项

| 位置 | Field ID | 当前选项 | 需要差异化? |
|------|----------|----------|------------|
| Line 200-205 | action (域名处理) | 保留并继续付费, 转让给他人, 取消/不续费 | 否 - 仅翻译 |
| Line 290-295 | action (订阅处理) | 保留, 取消, 转让 | 否 - 仅翻译 |
| Line 337-346 | device-type (设备类型) | 服务器, 电脑, 笔记本, 手机, 平板, NAS 存储, 其他 | 否 - 仅翻译 |
| Line 557-564 | action (社交媒体处理) | 保留, 关闭, 导出数据后关闭, 出售（如果值得）, 转为纪念账户 | 否 - 仅翻译 |
| Line 667-674 | action (云服务处理) | 保留, 取消, 转移资源, 联系支持处理 | 否 - 仅翻译 |
| Line 873-878 | action (网站处理) | 保留, 转让所有权, 取消 | 否 - 仅翻译 |
| Line 947-952 | account-type (银行账户) | Checking 支票账户, Savings 储蓄账户, Both 两者都有 | 否 - 仅翻译 |
| Line 978-984 | action (银行处理) | 保留, 取出资金并关闭, 转移 | 否 - 仅翻译 |
| Line 1399-1404 | service-type (服务类型) | 手机, 网络, 套餐 | 否 - 仅翻译 |
| Line 1474-1478 | payment-type (支付类型) | 自动扣款（收款方扣款）, 定期账单支付（银行发起） | 否 - 仅翻译 |
| Line 1606-1615 | question (安全问题) | 第一只宠物的名字, 父亲的中间名... | **是** - 中英文问题不同 |
| Line 1707-1713 | code-type (密码类型) | PIN 码, 组合锁, 钥匙位置, 其他 | 否 - 仅翻译 |

---

## 统计汇总

### 需要翻译的文本数量（估计）

| 字段类型 | 数量（估计）|
|----------|-------------|
| Section.name | 5 |
| Section.description | 5 |
| Category.name | 30 |
| Category.description | 30 |
| Category.helpText | 30 |
| Item.label | ~80 |
| Item.placeholder | ~80 |
| Item.helpText | ~50 |
| Field.label | ~200 |
| Field.placeholder | ~200 |
| Field.helpText | ~30 |
| Option.label | ~60 |
| **总计** | **~800 条翻译文本** |

### 需要中英文差异化的选项组

1. **通讯平台** (platform in contact-list)
   - 中文版添加: 微信, QQ, 微博, 钉钉, 飞书
   - 英文版保留: iMessages, WhatsApp, Facebook, etc.

2. **社交媒体平台** (platform in social-account)
   - 中文版添加: 微信, 微博, 小红书, 抖音, B站, 知乎, 豆瓣
   - 英文版保留: Twitter/X, Facebook, Instagram, etc.

3. **安全问题** (question in security-question)
   - 中文版可能需要不同问题模式

4. **设备类型/IoT设备类型** 
   - 翻译即可，无需差异化

---

## 当前 i18n 状态

### 已实现
- ✅ i18next 配置完成
- ✅ UI 文本已翻译 (zh-CN.json, en-US.json)
- ✅ 语言切换功能工作正常

### 未实现
- ❌ checklistStructure.ts 中的静态文本未国际化
- ❌ select 选项未国际化
- ❌ 中英文选项差异化未实现
- ❌ placeholder/helpText 未国际化

---

## 建议的 i18n key 命名结构

```
checklist:
  sections:
    emergency-contacts:
      name: "紧急联系人"
      description: "..."
      categories:
        contact-list:
          name: "联系人列表"
          description: "..."
          helpText: "..."
          items:
            contact:
              label: "联系人"
              helpText: "..."
              fields:
                platform:
                  label: "通讯平台"
                  placeholder: "选择平台"
                  options:
                    imessage: "iMessages"
                    wechat: "微信"  # 仅中文版
                    ...
```

---

## 下一步

1. 设计完整的 i18n key 结构
2. 提取所有文本到翻译文件
3. 设计选项差异化方案（语言相关选项）
4. 重构 checklistStructure.ts 使用 i18n
