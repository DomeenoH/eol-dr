# Requirements Document

## Introduction

本文档定义了 "End-of-life Disaster Response Checklist" 交互式 Web 应用的需求。该应用将原始的静态 checklist.md 文档转换为一个用户友好的交互式向导，引导用户逐步填写所有重要的身后事信息，支持断点保存和无缝继续填写功能。

目标用户是希望为家人准备"身后事"清单的技术人员，帮助他们系统地记录联系人、技术资产、财务信息等关键信息。

## Glossary

- **Checklist_App**: 交互式 checklist Web 应用程序
- **Section**: checklist 的主要分类（紧急联系人、Tech 技术、Input 收入、Output 支出、Misc 杂项）
- **Category**: Section 下的子分类（如 Emails、Domains、Subscriptions 等）
- **Item**: 单个可填写的条目（如一个联系人、一个账户信息）
- **Progress_State**: 用户填写进度的状态数据
- **Local_Storage**: 浏览器本地存储，用于保存用户数据
- **Guided_Mode**: 引导模式，按顺序逐步引导用户填写
- **Free_Mode**: 自由模式，用户可自行选择填写顺序

## Requirements

### Requirement 1: 多模式填写体验

**User Story:** 作为用户，我希望能够选择跟随引导逐步填写，或者自由选择想填写的部分，以便我可以按照自己的节奏完成清单。

#### Acceptance Criteria

1. WHEN 用户首次访问应用 THEN THE Checklist_App SHALL 显示欢迎页面并提供两种填写模式选择：Guided_Mode 和 Free_Mode
2. WHEN 用户选择 Guided_Mode THEN THE Checklist_App SHALL 按照 Section 和 Category 的预设顺序依次引导填写
3. WHEN 用户选择 Free_Mode THEN THE Checklist_App SHALL 显示所有 Section 和 Category 的概览，允许用户点击任意部分开始填写
4. WHEN 用户在 Guided_Mode 中填写时 THEN THE Checklist_App SHALL 提供"跳过此部分"按钮，允许用户跳过当前 Category
5. THE Checklist_App SHALL 允许用户随时在 Guided_Mode 和 Free_Mode 之间切换

### Requirement 2: 分步引导填写

**User Story:** 作为用户，我希望被引导逐步填写 checklist 的各个部分，以便我能够系统地完成所有必要信息的录入。

#### Acceptance Criteria

1. WHEN 用户在 Guided_Mode 中开始填写 THEN THE Checklist_App SHALL 从紧急联系人 Section 开始，按顺序展示各个 Category
2. WHEN 用户完成当前 Category 的填写 THEN THE Checklist_App SHALL 显示"下一步"按钮导航到下一个 Category
3. THE Checklist_App SHALL 在侧边栏显示当前填写进度和所有 Section/Category 的导航树
4. WHEN 用户点击导航中的任意 Section 或 Category THEN THE Checklist_App SHALL 跳转到对应位置
5. WHEN 用户完成一个 Section 的所有 Category THEN THE Checklist_App SHALL 显示该 Section 的完成摘要并提供进入下一 Section 的选项

### Requirement 3: 数据本地持久化

**User Story:** 作为用户，我希望我填写的数据能够自动保存在本地，以便我可以随时中断并在之后无缝继续填写。

#### Acceptance Criteria

1. WHEN 用户修改任何表单字段 THEN THE Checklist_App SHALL 在 500ms 内自动保存数据到 Local_Storage
2. WHEN 用户重新访问应用 THEN THE Checklist_App SHALL 自动加载之前保存的 Progress_State 和所有填写数据
3. WHEN 用户重新访问应用且存在已保存数据 THEN THE Checklist_App SHALL 提供"继续上次填写"选项，定位到上次离开的位置
4. THE Checklist_App SHALL 在页面底部或顶部显示保存状态指示器（如"已保存"、"保存中..."）
5. IF Local_Storage 不可用或存储空间不足 THEN THE Checklist_App SHALL 显示警告信息并提示用户导出数据备份

### Requirement 4: 数据导出与导入

**User Story:** 作为用户，我希望能够导出我填写的所有数据，以便我可以备份、打印或在其他设备上继续填写。

#### Acceptance Criteria

1. WHEN 用户点击导出按钮 THEN THE Checklist_App SHALL 提供导出格式选择
2. THE Checklist_App SHALL 支持导出为 JSON 格式用于数据备份和跨设备迁移
3. THE Checklist_App SHALL 支持导出为可打印的 Markdown 或 HTML 格式，保持与原 checklist.md 相似的结构
4. WHEN 导出数据时 THEN THE Checklist_App SHALL 在导出文件中包含导出时间戳
5. THE Checklist_App SHALL 提供导入 JSON 备份文件的功能，允许用户恢复或迁移数据

### Requirement 5: 数据预览功能

**User Story:** 作为用户，我希望能够在应用内预览我填写的所有内容，以便我可以检查信息是否完整和正确。

#### Acceptance Criteria

1. THE Checklist_App SHALL 提供预览页面，以类似原 checklist.md 的可读文档格式展示所有填写内容
2. WHEN 用户进入预览页面 THEN THE Checklist_App SHALL 显示所有已填写的 Section 和 Category 内容
3. THE Checklist_App SHALL 在预览页面默认隐藏敏感信息（如密码、PIN码），并提供"显示/隐藏"切换按钮
4. THE Checklist_App SHALL 在预览页面提供打印功能，使用打印友好的样式
5. THE Checklist_App SHALL 在预览页面提供直接导出为各种格式的按钮
6. THE Checklist_App SHALL 在预览页面提供"返回编辑"按钮，允许用户随时返回编辑模式

### Requirement 6: 数据安全性

**User Story:** 作为用户，我希望我的敏感信息得到保护，以便我可以放心地填写密码、PIN码和财务信息。

#### Acceptance Criteria

1. THE Checklist_App SHALL 仅在用户本地浏览器中存储数据，不向任何外部服务器发送数据
2. THE Checklist_App SHALL 对敏感字段（如密码、PIN码、安全问题答案）使用 password 类型输入框，默认隐藏内容
3. THE Checklist_App SHALL 为敏感字段提供"显示/隐藏"切换按钮
4. THE Checklist_App SHALL 提供"清除所有数据"功能
5. WHEN 用户请求清除所有数据 THEN THE Checklist_App SHALL 显示确认对话框，要求用户二次确认后才执行清除

### Requirement 7: 响应式设计

**User Story:** 作为用户，我希望能够在手机、平板和电脑上使用这个应用，以便我可以在任何设备上填写信息。

#### Acceptance Criteria

1. THE Checklist_App SHALL 在 320px 至 2560px 宽度范围内正常显示和使用
2. WHEN 在移动设备上访问 THEN THE Checklist_App SHALL 使用适合触摸操作的 UI 元素（足够大的点击区域、适当的间距）
3. WHEN 屏幕宽度小于 768px THEN THE Checklist_App SHALL 将侧边导航转换为可折叠的汉堡菜单
4. THE Checklist_App SHALL 在不同屏幕尺寸下保持一致的功能可用性

### Requirement 7: 用户友好的表单设计

**User Story:** 作为用户（可能是非技术人员的家属），我希望表单简单易懂，以便我能够轻松完成填写而不感到困惑。

#### Acceptance Criteria

1. THE Checklist_App SHALL 为每个 Category 显示来自原 checklist.md 的说明文字和上下文信息
2. THE Checklist_App SHALL 为复杂字段提供帮助提示、占位符文本或示例
3. THE Checklist_App SHALL 支持动态添加和删除重复类型的 Item（如多个联系人、多个银行账户、多个订阅服务）
4. THE Checklist_App SHALL 使用适当的 HTML5 输入类型（tel、email、url、number）以便移动设备显示正确的键盘
5. WHEN 用户尝试离开包含未保存更改的页面 THEN THE Checklist_App SHALL 显示确认提示

### Requirement 8: 用户友好的表单设计

**User Story:** 作为用户（可能是非技术人员的家属），我希望表单简单易懂，以便我能够轻松完成填写而不感到困惑。

#### Acceptance Criteria

1. THE Checklist_App SHALL 为每个 Category 显示来自原 checklist.md 的说明文字和上下文信息
2. THE Checklist_App SHALL 为复杂字段提供帮助提示、占位符文本或示例
3. THE Checklist_App SHALL 支持动态添加和删除重复类型的 Item（如多个联系人、多个银行账户、多个订阅服务）
4. THE Checklist_App SHALL 使用适当的 HTML5 输入类型（tel、email、url、number）以便移动设备显示正确的键盘
5. WHEN 用户尝试离开包含未保存更改的页面 THEN THE Checklist_App SHALL 显示确认提示

### Requirement 9: 可视化表单设计

**User Story:** 作为用户，我希望表单能够以可视化的方式呈现，模拟真实的平台界面，而不是冰冷的问卷形式。

#### Acceptance Criteria

1. THE Checklist_App SHALL 为社交媒体账户使用对应平台的品牌颜色和图标，模拟登录界面风格
2. THE Checklist_App SHALL 为紧急联系人使用聊天气泡风格展示，直观显示通知顺序
3. THE Checklist_App SHALL 为订阅服务使用服务 Logo 网格布局，带有"保留/取消/转让"状态标签
4. THE Checklist_App SHALL 为设备和硬件使用设备图标卡片，显示继承人和格式化要求
5. THE Checklist_App SHALL 为银行账户使用银行卡片风格，包含账户类型选择和 PIN 码隐藏显示

### Requirement 10: 进度追踪

**User Story:** 作为用户，我希望能够看到我的填写进度，以便我知道还有多少内容需要完成。

#### Acceptance Criteria

1. THE Checklist_App SHALL 显示整体完成百分比
2. THE Checklist_App SHALL 为每个 Section 显示独立的完成进度
3. THE Checklist_App SHALL 在导航中用视觉标识（图标或颜色）区分已完成、进行中和未开始的 Section/Category
4. WHEN 一个 Category 中至少有一个 Item 被填写 THEN THE Checklist_App SHALL 将该 Category 标记为"进行中"
5. WHEN 用户完成所有 Section THEN THE Checklist_App SHALL 显示完成祝贺页面，并提醒用户导出数据

### Requirement 11: Checklist 数据结构

**User Story:** 作为用户，我希望 checklist 涵盖原文档中的所有信息类别，以便我的家人在紧急情况下能够获得所需的所有信息。

#### Acceptance Criteria

1. THE Checklist_App SHALL 包含紧急联系人 Section，支持录入多个联系人，每个联系人包含姓名、联系平台（iMessages/WhatsApp/Facebook/Skype/Discord/Google Chat/Instagram/Email）和联系方式
2. THE Checklist_App SHALL 包含 Tech 技术 Section，涵盖以下 Category：Emails、Domains and Blogs、Password Managers、Subscriptions、Homelabs、Wireless Network、Network Services、Home Automation/IoT、Social Media、2FA、Cloud Subscriptions、Online Storage、Local Storage、Websites、Tech Tips
3. THE Checklist_App SHALL 包含 Input 收入 Section，涵盖以下 Category：Bank Accounts、Virtual Currency、Life Insurance、Residual Income、Investments
4. THE Checklist_App SHALL 包含 Output 支出 Section，涵盖以下 Category：Insurance Accounts、Credit Cards and Loans、Cell Phone and Internet、Bill Auto Pay
5. THE Checklist_App SHALL 包含 Misc 杂项 Section，涵盖以下 Category：Financial Advisor、Accountant、Security Questions、Physical Security
