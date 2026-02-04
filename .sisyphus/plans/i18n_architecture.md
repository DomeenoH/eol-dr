# i18n 架构设计文档

## 设计目标

1. **完整分离**: 将 `checklistStructure.ts` 中的所有静态文本提取到翻译文件
2. **选项差异化**: 支持中英文使用不同的表单选项列表
3. **向后兼容**: 不破坏现有的数据存储格式
4. **易于维护**: 清晰的 key 命名规范，便于后续扩展

---

## 核心方案：运行时翻译 + 选项工厂

### 方案概述

```
┌─────────────────────────────────────────────────────────────┐
│                     i18n 架构                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ zh-CN.json   │    │ en-US.json   │    │   ...        │  │
│  │ (翻译文件)    │    │ (翻译文件)    │    │              │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                               │
│         └─────────┬─────────┘                               │
│                   ▼                                         │
│         ┌─────────────────┐                                 │
│         │   i18next       │                                 │
│         │   (翻译引擎)     │                                 │
│         └────────┬────────┘                                 │
│                  ▼                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  useChecklistStructure() Hook                        │   │
│  │  - 根据当前语言返回翻译后的结构                         │   │
│  │  - 动态合并语言特定选项                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                  ▼                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Components (ItemForm, CategoryForm, etc.)           │   │
│  │  - 使用翻译后的结构渲染                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 翻译 Key 命名规范

### 层级结构

```
checklist
├── sections
│   └── [section-id]
│       ├── name
│       ├── description
│       └── categories
│           └── [category-id]
│               ├── name
│               ├── description
│               ├── helpText
│               └── items
│                   └── [item-id]
│                       ├── label
│                       ├── placeholder
│                       ├── helpText
│                       └── fields (for group type)
│                           └── [field-id]
│                               ├── label
│                               ├── placeholder
│                               └── helpText
├── options
│   └── [option-group-id]
│       ├── [value]: label
│       └── ...
└── optionLists
    └── [option-group-id]: [value1, value2, ...] (语言特定的选项顺序)
```

### 示例

```json
{
  "checklist": {
    "sections": {
      "emergency-contacts": {
        "name": "紧急联系人",
        "description": "在社交媒体公开宣布前，先直接联系以下亲友。",
        "categories": {
          "contact-list": {
            "name": "联系人列表",
            "description": "请按以下顺序通知这些人。",
            "helpText": "添加需要通知的联系人，选择他们使用的通讯平台。",
            "items": {
              "contact": {
                "label": "联系人",
                "helpText": "添加一个需要通知的联系人",
                "fields": {
                  "platform": {
                    "label": "通讯平台",
                    "placeholder": "选择平台"
                  },
                  "names": {
                    "label": "联系人姓名",
                    "placeholder": "例如：Blake, 兄弟",
                    "helpText": "可以输入多个姓名，用逗号分隔"
                  }
                }
              }
            }
          }
        }
      }
    },
    "options": {
      "messaging-platforms": {
        "wechat": "微信",
        "qq": "QQ",
        "weibo": "微博",
        "imessage": "iMessage",
        "whatsapp": "WhatsApp",
        "email": "邮件",
        "other": "其他"
      }
    },
    "optionLists": {
      "messaging-platforms": ["wechat", "qq", "weibo", "imessage", "whatsapp", "email", "other"]
    }
  }
}
```

---

## 选项差异化方案

### 方案：optionLists + options 分离

**原理**：
- `options` 对象包含所有可能的选项的翻译
- `optionLists` 数组定义每种语言显示哪些选项及其顺序

**优点**：
1. 选项翻译集中管理
2. 语言特定选项通过列表控制
3. 用户已保存的数据不受影响（value 值不变）
4. 新增选项只需添加到对应语言的 optionLists

### 需要差异化的选项组

| Option Group ID | 中文版特有选项 | 英文版特有选项 |
|-----------------|---------------|---------------|
| `messaging-platforms` | wechat, qq, weibo, dingtalk, feishu | telegram, signal, slack |
| `social-platforms` | wechat, weibo, xiaohongshu, douyin, bilibili, zhihu | snapchat, pinterest, threads, bluesky, mastodon |
| `security-questions` | 中文常见问题 | 英文常见问题 |

---

## 文件结构变更

### 新增文件

```
src/
├── data/
│   ├── checklistStructure.ts     # 修改：使用 i18n keys
│   └── checklistStructureBase.ts # 新增：包含 IDs 和结构的纯数据
├── hooks/
│   └── useChecklistStructure.ts  # 新增：返回翻译后的结构
├── i18n/
│   ├── index.ts                  # 修改：可能调整配置
│   └── locales/
│       ├── zh-CN.json            # 修改：添加 checklist 翻译
│       └── en-US.json            # 修改：添加 checklist 翻译
```

### checklistStructureBase.ts 结构

这个文件只包含结构定义和 ID，不包含任何可翻译的文本：

```typescript
// src/data/checklistStructureBase.ts
export const checklistStructureBase = {
  sections: [
    {
      id: 'emergency-contacts',
      categories: [
        {
          id: 'contact-list',
          items: [
            {
              id: 'contact',
              type: 'group',
              repeatable: true,
              fields: [
                {
                  id: 'platform',
                  type: 'select',
                  optionGroupId: 'messaging-platforms' // 引用选项组
                },
                {
                  id: 'names',
                  type: 'text'
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
```

### useChecklistStructure Hook

```typescript
// src/hooks/useChecklistStructure.ts
import { useTranslation } from 'react-i18next';
import { checklistStructureBase } from '../data/checklistStructureBase';
import type { ChecklistStructure, ItemDefinition } from '../types/checklist-structure';

export function useChecklistStructure(): ChecklistStructure {
  const { t, i18n } = useTranslation();
  
  // 递归翻译结构
  function translateItem(item: BaseItem, path: string): ItemDefinition {
    const translatedItem: ItemDefinition = {
      ...item,
      label: t(`${path}.label`),
      placeholder: t(`${path}.placeholder`, { defaultValue: '' }),
      helpText: t(`${path}.helpText`, { defaultValue: '' }),
    };
    
    // 处理选项
    if (item.optionGroupId) {
      const optionList = t(`checklist.optionLists.${item.optionGroupId}`, { returnObjects: true }) as string[];
      translatedItem.options = optionList.map(value => ({
        value,
        label: t(`checklist.options.${item.optionGroupId}.${value}`)
      }));
    }
    
    // 递归处理子字段
    if (item.fields) {
      translatedItem.fields = item.fields.map(field => 
        translateItem(field, `${path}.fields.${field.id}`)
      );
    }
    
    return translatedItem;
  }
  
  // ... 完整实现
}
```

---

## 翻译文件结构

### zh-CN.json 新增内容

```json
{
  "checklist": {
    "sections": {
      "emergency-contacts": {
        "name": "紧急联系人",
        "description": "在社交媒体公开宣布前，先直接联系以下亲友。",
        "categories": {
          "contact-list": {
            "name": "联系人列表",
            "description": "请按以下顺序通知这些人。",
            "helpText": "添加需要通知的联系人，选择他们使用的通讯平台。"
          }
        }
      }
    },
    "options": {
      "messaging-platforms": {
        "wechat": "微信",
        "qq": "QQ",
        "weibo": "微博私信",
        "dingtalk": "钉钉",
        "feishu": "飞书",
        "imessage": "iMessage",
        "whatsapp": "WhatsApp",
        "email": "邮件",
        "phone": "电话",
        "sms": "短信",
        "other": "其他"
      },
      "social-platforms": {
        "wechat": "微信",
        "weibo": "微博",
        "xiaohongshu": "小红书",
        "douyin": "抖音",
        "bilibili": "B站",
        "zhihu": "知乎",
        "twitter": "Twitter/X",
        "facebook": "Facebook",
        "instagram": "Instagram",
        "youtube": "YouTube",
        "linkedin": "LinkedIn",
        "github": "GitHub",
        "other": "其他"
      }
    },
    "optionLists": {
      "messaging-platforms": ["wechat", "qq", "weibo", "dingtalk", "feishu", "imessage", "whatsapp", "email", "phone", "sms", "other"],
      "social-platforms": ["wechat", "weibo", "xiaohongshu", "douyin", "bilibili", "zhihu", "twitter", "facebook", "instagram", "youtube", "linkedin", "github", "other"]
    }
  }
}
```

### en-US.json 新增内容

```json
{
  "checklist": {
    "sections": {
      "emergency-contacts": {
        "name": "Emergency Contacts",
        "description": "Contact the following friends and family directly before announcing on social media.",
        "categories": {
          "contact-list": {
            "name": "Contact List",
            "description": "Notify these people in the following order.",
            "helpText": "Add contacts to notify, select their preferred communication platform."
          }
        }
      }
    },
    "options": {
      "messaging-platforms": {
        "imessage": "iMessage",
        "whatsapp": "WhatsApp",
        "facebook": "Facebook Messenger",
        "telegram": "Telegram",
        "signal": "Signal",
        "discord": "Discord",
        "slack": "Slack",
        "email": "Email",
        "phone": "Phone Call",
        "sms": "SMS/Text",
        "other": "Other"
      },
      "social-platforms": {
        "twitter": "Twitter/X",
        "facebook": "Facebook",
        "instagram": "Instagram",
        "linkedin": "LinkedIn",
        "tiktok": "TikTok",
        "youtube": "YouTube",
        "reddit": "Reddit",
        "threads": "Threads",
        "bluesky": "Bluesky",
        "mastodon": "Mastodon",
        "pinterest": "Pinterest",
        "snapchat": "Snapchat",
        "github": "GitHub",
        "other": "Other"
      }
    },
    "optionLists": {
      "messaging-platforms": ["imessage", "whatsapp", "facebook", "telegram", "signal", "discord", "slack", "email", "phone", "sms", "other"],
      "social-platforms": ["twitter", "facebook", "instagram", "linkedin", "tiktok", "youtube", "reddit", "threads", "bluesky", "mastodon", "pinterest", "snapchat", "github", "other"]
    }
  }
}
```

---

## 类型定义更新

### 新增类型

```typescript
// src/types/checklist-structure.ts

// 基础结构类型（不含翻译文本）
export interface BaseItemDefinition {
  id: string;
  type: ItemType;
  sensitive?: boolean;
  required?: boolean;
  repeatable?: boolean;
  fields?: BaseItemDefinition[];
  optionGroupId?: string;  // 新增：引用选项组
}

export interface BaseCategory {
  id: string;
  items: BaseItemDefinition[];
}

export interface BaseSection {
  id: string;
  categories: BaseCategory[];
}

export interface BaseChecklistStructure {
  sections: BaseSection[];
}
```

---

## 组件更新

### ItemForm.tsx 变更

主要变更点：
1. `请选择...` 使用 `t('common.select')`
2. 已有翻译文本直接使用，无需额外处理

```tsx
// 行 317 变更
<option value="">{t('common.select')}</option>
```

### 其他组件

需要确保所有使用 `checklistStructure` 的组件改用 `useChecklistStructure()` hook。

---

## 实施步骤

### Phase 1: 准备翻译内容 (task-004, task-005)
1. 更新 `zh-CN.json`，添加完整的 `checklist` 翻译
2. 更新 `en-US.json`，添加完整的 `checklist` 翻译

### Phase 2: 重构结构 (task-006)
1. 创建 `checklistStructureBase.ts`
2. 创建 `useChecklistStructure` hook
3. 更新 `checklistStructure.ts` 导出兼容接口

### Phase 3: 更新组件 (task-007)
1. 更新所有使用结构的组件
2. 确保语言切换时选项正确更新

### Phase 4: 验证 (task-008)
1. 测试中英文切换
2. 验证表单选项差异化
3. 确保数据兼容性

---

## 风险与注意事项

### 数据兼容性
- **关键**：选项的 `value` 值不能更改，只能更改 `label`
- 用户已保存的数据使用 `value` 存储，翻译只影响显示

### 性能考虑
- Hook 需要做适当的 memoization
- 避免在每次渲染时重新计算整个结构

### 测试覆盖
- 需要更新现有测试以支持多语言
- 添加语言切换的集成测试

---

## 时间估算

| 任务 | 预估时间 |
|------|---------|
| task-004: 更新 zh-CN.json | 45 分钟 |
| task-005: 更新 en-US.json | 45 分钟 |
| task-006: 重构结构 | 60 分钟 |
| task-007: 更新组件 | 30 分钟 |
| task-008: 验证测试 | 30 分钟 |
| **总计** | **~3.5 小时** |
