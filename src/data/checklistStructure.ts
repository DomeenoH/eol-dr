/**
 * Checklist Static Structure Data
 * Based on checklist.md - End-of-life disaster response
 * 
 * This file defines all Sections, Categories, and ItemDefinitions
 * with descriptions, help text, field types, sensitive flags, and repeatable flags.
 * 
 * Requirements: 11.1-11.5, 8.1-8.2
 */

import type { ChecklistStructure, Section, Category } from '../types/checklist-structure';

/**
 * Section 1: 紧急联系人 (Emergency Contacts)
 * Contact the following friends and family directly before announcing it on social media.
 */
const emergencyContactsSection: Section = {
  id: 'emergency-contacts',
  name: '紧急联系人',
  description: 'Contact the following friends and family directly before announcing it on Twitter. Open up my laptop, create a note, then copy/paste it to each platform.',
  categories: [
    {
      id: 'contact-list',
      name: '联系人列表',
      description: '请按以下顺序通知这些人。在社交媒体上公开宣布之前，先直接联系以下亲友。',
      helpText: '添加需要通知的联系人，选择他们使用的通讯平台，并按优先级排序。',
      items: [
        {
          id: 'contact',
          label: '联系人',
          type: 'group',
          repeatable: true,
          helpText: '添加一个需要通知的联系人',
          fields: [
            {
              id: 'platform',
              label: '通讯平台',
              type: 'select',
              placeholder: '选择平台',
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
            },
            {
              id: 'names',
              label: '联系人姓名',
              type: 'text',
              placeholder: '例如：Blake, Brother, Brother 2',
              helpText: '可以输入多个姓名，用逗号分隔'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：电话号码在我手机里',
              helpText: '任何额外的联系信息或说明'
            }
          ]
        }
      ]
    },
    {
      id: 'social-announcement',
      name: '社交媒体公告',
      description: '在通知完亲友后，在社交媒体上发布公告。',
      helpText: '列出需要发布公告的社交媒体平台。',
      items: [
        {
          id: 'platforms-to-announce',
          label: '需要公告的平台',
          type: 'textarea',
          placeholder: 'Twitter, Facebook, Instagram...',
          helpText: '列出所有需要发布公告的社交媒体平台'
        }
      ]
    }
  ]
};


/**
 * Section 2: Tech 技术
 * This section covers the topics that will help you access my emails and website logins.
 */
const techSection: Section = {
  id: 'tech',
  name: 'Tech 技术',
  description: 'This section covers the topics that will help you access my emails and website logins. It\'ll also let you know who to give my tech things to or who to ask for help when something breaks.',
  categories: [
    // Category: Emails 邮箱
    {
      id: 'emails',
      name: 'Emails 邮箱',
      description: '主要使用的邮箱账户。可以通过手机或笔记本电脑登录。保留手机和笔记本电脑至少一年，以防出现 2FA 问题。',
      helpText: '添加所有重要的邮箱账户信息。',
      items: [
        {
          id: 'email-account',
          label: '邮箱账户',
          type: 'group',
          repeatable: true,
          helpText: '添加一个邮箱账户',
          fields: [
            {
              id: 'email',
              label: '邮箱地址',
              type: 'email',
              placeholder: 'example@domain.com',
              required: true
            },
            {
              id: 'password-location',
              label: '密码存储位置',
              type: 'text',
              placeholder: '例如：存储在 KeePass 中',
              helpText: '说明密码存储在哪里，而不是直接写密码'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：所有邮件转发到主邮箱',
              helpText: '任何关于此邮箱的额外说明'
            },
            {
              id: 'is-primary',
              label: '是否为主要邮箱',
              type: 'checkbox'
            }
          ]
        },
        {
          id: 'email-tips',
          label: '邮箱使用提示',
          type: 'textarea',
          placeholder: '例如：将主邮箱添加到你的手机，因为那是我们收到快递通知的地方',
          helpText: '关于邮箱使用的任何建议'
        }
      ]
    },
    // Category: Domains and Blogs 域名和博客
    {
      id: 'domains-blogs',
      name: 'Domains and Blogs 域名和博客',
      description: '域名和博客的管理信息。',
      helpText: '记录所有域名的注册商和续费信息。',
      items: [
        {
          id: 'domain-registrar',
          label: '域名注册商',
          type: 'group',
          repeatable: true,
          helpText: '添加域名注册商信息',
          fields: [
            {
              id: 'registrar-name',
              label: '注册商名称',
              type: 'text',
              placeholder: '例如：Google Domains, CloudFlare, GoDaddy'
            },
            {
              id: 'auto-renew',
              label: '是否自动续费',
              type: 'checkbox'
            },
            {
              id: 'payment-method',
              label: '支付方式',
              type: 'text',
              placeholder: '例如：需要更新信用卡才能继续续费'
            }
          ]
        },
        {
          id: 'domain',
          label: '域名',
          type: 'group',
          repeatable: true,
          helpText: '添加一个域名',
          fields: [
            {
              id: 'domain-name',
              label: '域名',
              type: 'url',
              placeholder: 'example.com'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留并继续付费' },
                { value: 'transfer', label: '转让给他人' },
                { value: 'cancel', label: '取消/不续费' }
              ]
            },
            {
              id: 'transfer-to',
              label: '转让给',
              type: 'text',
              placeholder: '例如：转让给 Blake',
              showWhen: {
                fieldId: 'action',
                value: 'transfer'
              }
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '任何额外说明'
            }
          ]
        }
      ]
    },
    // Category: Password Managers 密码管理器
    {
      id: 'password-managers',
      name: 'Password Managers 密码管理器',
      description: '密码管理器是访问所有其他账户的关键。',
      helpText: '记录密码管理器的主密码。这是最重要的信息之一。',
      items: [
        {
          id: 'password-manager',
          label: '密码管理器',
          type: 'group',
          repeatable: true,
          helpText: '添加一个密码管理器',
          fields: [
            {
              id: 'name',
              label: '名称',
              type: 'text',
              placeholder: '例如：KeePass, 1Password, LastPass, Bitwarden'
            },
            {
              id: 'master-password',
              label: '主密码',
              type: 'password',
              sensitive: true,
              helpText: '这是访问所有其他密码的关键'
            },
            {
              id: 'location',
              label: '数据库位置',
              type: 'text',
              placeholder: '例如：存储在 Dropbox 中',
              helpText: '密码数据库文件的存储位置'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '任何额外说明'
            }
          ]
        }
      ]
    },
    // Category: Subscriptions 订阅服务
    {
      id: 'subscriptions',
      name: 'Subscriptions 订阅服务',
      description: '各种订阅服务的处理方式。',
      helpText: '记录所有订阅服务，并标注是保留、取消还是转让。',
      items: [
        {
          id: 'subscription',
          label: '订阅服务',
          type: 'group',
          repeatable: true,
          helpText: '添加一个订阅服务',
          fields: [
            {
              id: 'service-name',
              label: '服务名称',
              type: 'text',
              placeholder: '例如：YouTube Premium, Netflix, Spotify'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留' },
                { value: 'cancel', label: '取消' },
                { value: 'transfer', label: '转让' }
              ]
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：这是家庭账户，保留它'
            }
          ]
        },
        {
          id: 'apple-subscriptions-note',
          label: 'Apple 订阅说明',
          type: 'textarea',
          helpText: '如何查看和管理 Apple 订阅：打开 iPhone 设置 > 点击顶部的名字 > 点击订阅',
          placeholder: '列出需要取消的 Apple 订阅，如 Wondery+, Twitter, Apple News 等'
        }
      ]
    },
    // Category: Homelabs 家庭实验室
    {
      id: 'homelabs',
      name: 'Homelabs 家庭实验室',
      description: '⚠️ 重要：出售前必须格式化或销毁硬盘！这可能导致身份盗窃灾难。',
      helpText: '记录所有设备及其继承人，以及是否需要格式化。',
      items: [
        {
          id: 'device',
          label: '设备',
          type: 'group',
          repeatable: true,
          helpText: '添加一个设备',
          fields: [
            {
              id: 'device-name',
              label: '设备名称/描述',
              type: 'text',
              placeholder: '例如：大黑盒子（服务器）、NUC 小黑盒'
            },
            {
              id: 'device-type',
              label: '设备类型',
              type: 'select',
              options: [
                { value: 'server', label: '服务器' },
                { value: 'computer', label: '电脑' },
                { value: 'laptop', label: '笔记本' },
                { value: 'phone', label: '手机' },
                { value: 'tablet', label: '平板' },
                { value: 'nas', label: 'NAS 存储' },
                { value: 'other', label: '其他' }
              ]
            },
            {
              id: 'inheritor',
              label: '继承人',
              type: 'text',
              placeholder: '例如：Janet'
            },
            {
              id: 'needs-formatting',
              label: '需要格式化',
              type: 'checkbox',
              helpText: '出售或转让前是否需要格式化硬盘'
            },
            {
              id: 'special-instructions',
              label: '特殊说明',
              type: 'textarea',
              placeholder: '例如：需要从 Find My 注销才能使用'
            }
          ]
        },
        {
          id: 'general-notes',
          label: '通用说明',
          type: 'textarea',
          placeholder: '例如：保留手机和笔记本电脑至少一年，以防需要处理 2FA 问题'
        }
      ]
    },
    // Category: Wireless Network 无线网络
    {
      id: 'wireless-network',
      name: 'Wireless Network 无线网络',
      description: '无线网络设备和故障排除信息。',
      helpText: '记录网络设备信息和出问题时该联系谁。',
      items: [
        {
          id: 'wifi-name',
          label: 'WiFi 名称 (SSID)',
          type: 'text',
          placeholder: '例如：potatopie'
        },
        {
          id: 'wifi-password',
          label: 'WiFi 密码',
          type: 'password',
          sensitive: true
        },
        {
          id: 'network-device',
          label: '网络设备',
          type: 'group',
          repeatable: true,
          helpText: '添加一个网络设备',
          fields: [
            {
              id: 'device-name',
              label: '设备名称',
              type: 'text',
              placeholder: '例如：Unifi 无线设备'
            },
            {
              id: 'location',
              label: '位置',
              type: 'text',
              placeholder: '例如：楼上、楼下'
            }
          ]
        },
        {
          id: 'tech-contact',
          label: '技术支持联系人',
          type: 'text',
          placeholder: '例如：出问题时联系 Joe',
          helpText: '网络出问题时可以寻求帮助的人'
        },
        {
          id: 'troubleshooting-notes',
          label: '故障排除说明',
          type: 'textarea',
          placeholder: '例如：如果出问题无法通过重启解决，可以请人帮忙更换成更简单的设备'
        }
      ]
    },
    // Category: Network Services 网络服务重启
    {
      id: 'network-services',
      name: 'Network Services 网络服务',
      description: '网络服务故障排除步骤。',
      helpText: '记录网络出问题时的排查步骤。',
      items: [
        {
          id: 'troubleshooting-steps',
          label: '故障排除步骤',
          type: 'textarea',
          placeholder: '1. 重启黑色调制解调器（等待10秒）\n2. 如果不行，物理拔掉再插上\n3. 拔掉楼上和楼下的白色设备，等待20分钟\n4. 检查是否有网络中断\n5. 联系技术支持',
          helpText: '按顺序列出网络故障排除步骤'
        },
        {
          id: 'isp-info',
          label: 'ISP 信息',
          type: 'text',
          placeholder: '例如：Voo'
        },
        {
          id: 'tech-support-contact',
          label: '技术支持联系人',
          type: 'text',
          placeholder: '例如：Peter'
        }
      ]
    },
    // Category: Home Automation / IoT
    {
      id: 'home-automation',
      name: 'Home Automation/IoT 智能家居',
      description: '如果更改 WiFi 名称（例如搬家后使用 ISP 的内置 WiFi），需要重新连接这些设备。',
      helpText: '记录所有智能家居设备，以便在更换网络时重新连接。',
      items: [
        {
          id: 'iot-device',
          label: '智能设备',
          type: 'group',
          repeatable: true,
          helpText: '添加一个智能家居设备',
          fields: [
            {
              id: 'device-name',
              label: '设备名称',
              type: 'text',
              placeholder: '例如：Hue Hub, Sonos 音箱, Roku'
            },
            {
              id: 'device-type',
              label: '设备类型',
              type: 'select',
              options: [
                { value: 'lighting', label: '智能灯光' },
                { value: 'speaker', label: '智能音箱' },
                { value: 'streaming', label: '流媒体设备' },
                { value: 'vacuum', label: '扫地机器人' },
                { value: 'air-purifier', label: '空气净化器' },
                { value: 'camera', label: '摄像头' },
                { value: 'smart-plug', label: '智能插座' },
                { value: 'thermostat', label: '智能温控' },
                { value: 'other', label: '其他' }
              ]
            },
            {
              id: 'location',
              label: '位置',
              type: 'text',
              placeholder: '例如：楼上储物间'
            },
            {
              id: 'troubleshooting',
              label: '故障排除',
              type: 'textarea',
              placeholder: '例如：拔掉电源等待10秒后重新插上'
            }
          ]
        },
        {
          id: 'wifi-change-tip',
          label: 'WiFi 更换提示',
          type: 'textarea',
          placeholder: '例如：如果搬家，可以请人帮忙设置新 WiFi 使用相同的名称，这样设备就不需要重新连接',
          helpText: '关于更换 WiFi 时的建议'
        }
      ]
    },
    // Category: Social Media 社交媒体
    {
      id: 'social-media',
      name: 'Social Media 社交媒体',
      description: '社交媒体账户的处理方式。所有账户都可以通过 KeePass + 手机上的多因素认证应用登录。',
      helpText: '记录所有社交媒体账户及其处理方式。',
      items: [
        {
          id: 'social-account',
          label: '社交媒体账户',
          type: 'group',
          repeatable: true,
          helpText: '添加一个社交媒体账户',
          fields: [
            {
              id: 'platform',
              label: '平台',
              type: 'select',
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
            },
            {
              id: 'username',
              label: '用户名',
              type: 'text',
              placeholder: '@username'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留' },
                { value: 'close', label: '关闭' },
                { value: 'export-close', label: '导出数据后关闭' },
                { value: 'sell', label: '出售（如果值得）' },
                { value: 'memorial', label: '转为纪念账户' }
              ]
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：几年内不要关闭；如果出售，确保先删除所有旧帖子'
            }
          ]
        }
      ]
    },
    // Category: 2FA 双因素认证
    {
      id: '2fa',
      name: '2FA 双因素认证',
      description: '双因素认证（2FA）或多因素认证（MFA）是保护账户安全的重要措施。',
      helpText: '记录使用的认证应用和备用方法。',
      items: [
        {
          id: 'auth-app',
          label: '认证应用',
          type: 'group',
          repeatable: true,
          helpText: '添加一个认证应用',
          fields: [
            {
              id: 'app-name',
              label: '应用名称',
              type: 'text',
              placeholder: '例如：Authy, Microsoft Authenticator, Google Authenticator'
            },
            {
              id: 'is-primary',
              label: '是否为主要应用',
              type: 'checkbox'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：大多数情况下默认使用这个'
            }
          ]
        },
        {
          id: 'backup-phone',
          label: '备用电话号码',
          type: 'group',
          helpText: '某些账户需要美国电话号码接收短信',
          fields: [
            {
              id: 'phone-number',
              label: '电话号码',
              type: 'tel',
              placeholder: '555-555-5555'
            },
            {
              id: 'service',
              label: '服务提供商',
              type: 'text',
              placeholder: '例如：Skype 账户电话号码'
            }
          ]
        },
        {
          id: '2fa-tips',
          label: '2FA 使用提示',
          type: 'textarea',
          placeholder: '例如：尽量避免使用短信 2FA，因为它不太安全；继续使用 Authy 管理你自己的账户',
          helpText: '关于 2FA 的安全建议'
        }
      ]
    },
    // Category: Cloud Subscriptions 云服务订阅
    {
      id: 'cloud-subscriptions',
      name: 'Cloud Subscriptions 云服务订阅',
      description: '⚠️ 非常重要！这些账单可能会快速增长。',
      helpText: '记录所有云服务订阅，特别是那些可能产生大额账单的服务。',
      items: [
        {
          id: 'cloud-service',
          label: '云服务',
          type: 'group',
          repeatable: true,
          helpText: '添加一个云服务订阅',
          fields: [
            {
              id: 'service-name',
              label: '服务名称',
              type: 'text',
              placeholder: '例如：Microsoft Azure, AWS, Google Cloud'
            },
            {
              id: 'monthly-cost',
              label: '月费用（大约）',
              type: 'number',
              placeholder: '例如：5',
              helpText: '请输入数字金额（美元）'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留' },
                { value: 'cancel', label: '取消' },
                { value: 'transfer', label: '转移资源' },
                { value: 'contact-support', label: '联系支持处理' }
              ]
            },
            {
              id: 'contact-person',
              label: '联系人',
              type: 'text',
              placeholder: '例如：联系 Michelle 帮忙处理'
            },
            {
              id: 'support-phone',
              label: '支持电话',
              type: 'tel',
              placeholder: '例如：+1-800-865-9408'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：需要删除赞助订阅并转移资源'
            }
          ]
        }
      ]
    },
    // Category: Online Storage 在线存储
    {
      id: 'online-storage',
      name: 'Online Storage 在线存储',
      description: '在线存储和照片备份服务。这些包含我们所有的回忆，非常重要。',
      helpText: '记录所有在线存储服务，特别是照片备份。不要直接关闭账户，否则会丢失照片！',
      items: [
        {
          id: 'photo-backup',
          label: '照片备份服务',
          type: 'group',
          repeatable: true,
          helpText: '添加一个照片备份服务',
          fields: [
            {
              id: 'service-name',
              label: '服务名称',
              type: 'text',
              placeholder: '例如：Google Photos, iCloud, Amazon Photos'
            },
            {
              id: 'login-url',
              label: '登录网址',
              type: 'url',
              placeholder: 'https://photos.google.com'
            },
            {
              id: 'credentials-location',
              label: '登录凭据位置',
              type: 'text',
              placeholder: '例如：详情在 KeePass 中'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '⚠️ 不要直接关闭账户，否则会丢失照片！可以下载所有照片到电脑后再决定'
            }
          ]
        },
        {
          id: 'cloud-storage',
          label: '云存储服务',
          type: 'group',
          repeatable: true,
          helpText: '添加一个云存储服务',
          fields: [
            {
              id: 'service-name',
              label: '服务名称',
              type: 'text',
              placeholder: '例如：Dropbox, OneDrive, Google Drive'
            },
            {
              id: 'login-url',
              label: '登录网址',
              type: 'url',
              placeholder: 'https://drive.google.com'
            },
            {
              id: 'credentials-location',
              label: '登录凭据位置',
              type: 'text',
              placeholder: '例如：详情在 KeePass 中'
            },
            {
              id: 'content-description',
              label: '存储内容',
              type: 'textarea',
              placeholder: '例如：电视许可证收据、汽车续费文件等重要文档'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：即使不使用也建议保留，因为将来可能需要这些文件'
            }
          ]
        }
      ]
    },
    // Category: Local Storage 本地存储
    {
      id: 'local-storage',
      name: 'Local Storage 本地存储',
      description: '本地存储设备（如 NAS）包含所有不想上传到互联网的备份和数字生活。',
      helpText: '⚠️ 重要：如果决定不保留，请联系专业人士帮忙擦除数据，不要直接丢弃！',
      items: [
        {
          id: 'nas-device',
          label: 'NAS 设备',
          type: 'group',
          repeatable: true,
          helpText: '添加一个本地存储设备',
          fields: [
            {
              id: 'device-name',
              label: '设备名称/标签',
              type: 'text',
              placeholder: '例如：壁橱里带闪灯的小黑盒'
            },
            {
              id: 'location',
              label: '位置',
              type: 'text',
              placeholder: '例如：壁橱里'
            },
            {
              id: 'web-portal',
              label: '网页管理地址',
              type: 'url',
              placeholder: 'http://192.168.1.100'
            },
            {
              id: 'credentials-location',
              label: '登录凭据位置',
              type: 'text',
              placeholder: '例如：详情在 KeePass 中'
            },
            {
              id: 'computer-folder',
              label: '电脑上的映射文件夹',
              type: 'text',
              placeholder: '例如：登录电脑后可以看到一个叫 [文件夹名] 的文件夹'
            },
            {
              id: 'tech-contact',
              label: '技术支持联系人',
              type: 'text',
              placeholder: '例如：联系 [某人] 帮忙擦除数据'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '⚠️ 重要：不要直接丢弃，必须先擦除数据！'
            }
          ]
        }
      ]
    },
    // Category: Websites 网站
    {
      id: 'websites',
      name: 'Websites 网站',
      description: '托管的网站和相关服务。',
      helpText: '记录所有托管的网站及其续费信息。',
      items: [
        {
          id: 'website',
          label: '网站',
          type: 'group',
          repeatable: true,
          helpText: '添加一个网站',
          fields: [
            {
              id: 'domain',
              label: '域名',
              type: 'url',
              placeholder: 'example.com'
            },
            {
              id: 'hosting-provider',
              label: '托管服务商',
              type: 'text',
              placeholder: '例如：BlueHost, Vercel, Netlify'
            },
            {
              id: 'billing-cycle',
              label: '账单周期',
              type: 'text',
              placeholder: '例如：每年3月'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留' },
                { value: 'transfer', label: '转让所有权' },
                { value: 'cancel', label: '取消' }
              ]
            },
            {
              id: 'transfer-to',
              label: '转让给',
              type: 'text',
              placeholder: '例如：转让给 Blake',
              showWhen: {
                fieldId: 'action',
                value: 'transfer'
              }
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：联系托管商支持重置所有密码'
            }
          ]
        }
      ]
    },
    // Category: Tech Tips 技术提示
    {
      id: 'tech-tips',
      name: 'Tech Tips 技术提示',
      description: '重要的技术安全提示。',
      helpText: '记录任何重要的技术安全提示。',
      items: [
        {
          id: 'tips',
          label: '技术提示',
          type: 'textarea',
          placeholder: '• 永远不要在格式化硬盘之前出售任何带硬盘的设备\n• 永远不要在没有按照 Apple 说明擦除设备之前出售 Apple 产品\n• Apple 会将 Find My 与账户关联，如果不注销设备，买家将无法使用',
          helpText: '记录重要的技术安全提示，帮助家人避免身份盗窃等问题'
        }
      ]
    }
  ]
};

/**
 * Section 3: Input 收入
 * This is the section where money lands or exists.
 */
const inputSection: Section = {
  id: 'input',
  name: 'Input 收入',
  description: 'This is the section where money lands or exists. 这是资金来源和存放的部分。',
  categories: [
    // Category: Bank Accounts 银行账户
    {
      id: 'bank-accounts',
      name: 'Bank Accounts 银行账户',
      description: '我们有几个不同用途的银行账户。一个适合支付国际账单，另一个有很好的保险，还有一个是我用了很久的老账户。',
      helpText: '记录所有银行账户信息，包括用途和 PIN 码。',
      items: [
        {
          id: 'bank-account',
          label: '银行账户',
          type: 'group',
          repeatable: true,
          helpText: '添加一个银行账户',
          fields: [
            {
              id: 'bank-name',
              label: '银行名称',
              type: 'text',
              placeholder: '例如：Fak Bank, United States Bank'
            },
            {
              id: 'account-type',
              label: '账户类型',
              type: 'select',
              options: [
                { value: 'checking', label: 'Checking 支票账户' },
                { value: 'savings', label: 'Savings 储蓄账户' },
                { value: 'both', label: 'Both 两者都有' }
              ]
            },
            {
              id: 'pin',
              label: 'PIN 码',
              type: 'password',
              sensitive: true,
              placeholder: '****',
              helpText: '直接填写 PIN 码（可选）'
            },
            {
              id: 'pin-location',
              label: 'PIN 存储位置',
              type: 'text',
              placeholder: '例如：存储在 KeePass 中',
              helpText: '或者说明 PIN 存储在哪里（如密码管理器）'
            },
            {
              id: 'features',
              label: '特点/用途',
              type: 'textarea',
              placeholder: '例如：可以通过 IBAN 支付国际账单；有很好的贷款利率'
            },
            {
              id: 'action',
              label: '处理方式',
              type: 'select',
              options: [
                { value: 'keep', label: '保留' },
                { value: 'close', label: '取出资金并关闭' },
                { value: 'transfer', label: '转移' }
              ]
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：联合账户持有人去世后资金可立即使用；已预留 20,000 欧元'
            }
          ]
        },
        {
          id: 'paypal',
          label: 'PayPal',
          type: 'group',
          helpText: 'PayPal 账户信息',
          fields: [
            {
              id: 'email',
              label: '登录邮箱',
              type: 'email',
              placeholder: 'me@fake.com'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：不要关闭，但可以请朋友帮忙更改邮箱地址'
            }
          ]
        }
      ]
    },
    // Category: Virtual Currency 虚拟货币
    {
      id: 'virtual-currency',
      name: 'Virtual Currency 虚拟货币',
      description: '加密货币和虚拟货币账户。',
      helpText: '记录所有加密货币账户和钱包信息。',
      items: [
        {
          id: 'crypto-account',
          label: '加密货币账户',
          type: 'group',
          repeatable: true,
          helpText: '添加一个加密货币账户',
          fields: [
            {
              id: 'platform',
              label: '平台/钱包',
              type: 'text',
              placeholder: '例如：Coinbase, Binance, MetaMask'
            },
            {
              id: 'login-email',
              label: '登录邮箱',
              type: 'email'
            },
            {
              id: 'wallet-address',
              label: '钱包地址',
              type: 'text',
              placeholder: '0x...'
            },
            {
              id: 'seed-phrase-location',
              label: '助记词/私钥位置',
              type: 'password',
              sensitive: true,
              placeholder: '例如：存储在保险箱中',
              helpText: '⚠️ 不要直接写助记词，只说明存储位置'
            },
            {
              id: 'current-status',
              label: '当前状态',
              type: 'textarea',
              placeholder: '例如：可能将来会赚钱，但现在在亏损'
            },
            {
              id: 'tech-contact',
              label: '技术支持联系人',
              type: 'text',
              placeholder: '例如：应用很难操作，联系 Emily 寻求帮助'
            }
          ]
        }
      ]
    },
    // Category: Life Insurance 人寿保险
    {
      id: 'life-insurance',
      name: 'Life Insurance 人寿保险',
      description: '人寿保险信息。',
      helpText: '记录所有人寿保险的详细信息。',
      items: [
        {
          id: 'insurance-policy',
          label: '保险政策',
          type: 'group',
          repeatable: true,
          helpText: '添加一个人寿保险',
          fields: [
            {
              id: 'provider',
              label: '保险公司',
              type: 'text',
              placeholder: '例如：Fidelity'
            },
            {
              id: 'source',
              label: '来源',
              type: 'text',
              placeholder: '例如：通过雇主获得'
            },
            {
              id: 'natural-payout',
              label: '自然死亡赔付金额',
              type: 'number',
              placeholder: '例如：100000',
              helpText: '请输入数字金额'
            },
            {
              id: 'accidental-payout',
              label: '意外死亡赔付金额 (AD&D)',
              type: 'number',
              placeholder: '例如：200000',
              helpText: '请输入数字金额'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea'
            }
          ]
        }
      ]
    },
    // Category: Residual Income 被动收入
    {
      id: 'residual-income',
      name: 'Residual Income 被动收入',
      description: '自动存入银行账户的被动收入来源。',
      helpText: '记录所有被动收入来源。',
      items: [
        {
          id: 'income-source',
          label: '收入来源',
          type: 'group',
          repeatable: true,
          helpText: '添加一个被动收入来源',
          fields: [
            {
              id: 'source-name',
              label: '来源名称',
              type: 'text',
              placeholder: '例如：Book - Manning, Twitch, GitHub Sponsors'
            },
            {
              id: 'deposit-account',
              label: '存入账户',
              type: 'text',
              placeholder: '例如：United States Bank'
            },
            {
              id: 'frequency',
              label: '频率',
              type: 'text',
              placeholder: '例如：每月、每季度'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea'
            }
          ]
        }
      ]
    },
    // Category: Investments 投资
    {
      id: 'investments',
      name: 'Investments 投资',
      description: '投资账户信息。如果需要建议，可以致电投资公司咨询。',
      helpText: '记录所有投资账户。',
      items: [
        {
          id: 'investment-account',
          label: '投资账户',
          type: 'group',
          repeatable: true,
          helpText: '添加一个投资账户',
          fields: [
            {
              id: 'provider',
              label: '投资公司',
              type: 'text',
              placeholder: '例如：Fidelity, Charles Schwab, Victory Capital'
            },
            {
              id: 'account-type',
              label: '账户类型',
              type: 'text',
              placeholder: '例如：401k, 投资账户, 共同基金'
            },
            {
              id: 'performance',
              label: '表现',
              type: 'text',
              placeholder: '例如：表现良好、表现一般'
            },
            {
              id: 'contact-email',
              label: '联系邮箱',
              type: 'email',
              placeholder: '例如：email@vc.com'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：我只是设置好就不管了'
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Section 4: Output 支出
 * This is the section with bills and things you gotta pay.
 */
const outputSection: Section = {
  id: 'output',
  name: 'Output 支出',
  description: 'This is the section with bills and things you gotta pay. Everything is on auto-pay so no stress. Just keep money in the bank accounts. 这是账单和需要支付的部分。所有都是自动支付，只需确保银行账户有足够的钱。',
  categories: [
    // Category: Insurance Accounts 保险账户
    {
      id: 'insurance-accounts',
      name: 'Insurance Accounts 保险账户',
      description: '持续的保险账户。',
      helpText: '记录所有保险账户及其支付方式。',
      items: [
        {
          id: 'insurance',
          label: '保险',
          type: 'group',
          repeatable: true,
          helpText: '添加一个保险账户',
          fields: [
            {
              id: 'provider',
              label: '保险公司',
              type: 'text',
              placeholder: '例如：State Farm, Aetna'
            },
            {
              id: 'coverage-type',
              label: '保险类型',
              type: 'text',
              placeholder: '例如：汽车保险、房屋保险、伞形保险、健康保险'
            },
            {
              id: 'monthly-cost',
              label: '月费用',
              type: 'number',
              placeholder: '例如：100',
              helpText: '请输入数字金额（美元）'
            },
            {
              id: 'payment-account',
              label: '支付账户',
              type: 'text',
              placeholder: '例如：从 Fak Bank 扣款'
            },
            {
              id: 'app-info',
              label: '应用信息',
              type: 'text',
              placeholder: '例如：应用在我手机上'
            },
            {
              id: 'claim-process',
              label: '理赔流程',
              type: 'textarea',
              placeholder: '例如：先付款，然后上传账单，他们会报销'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：搬家时记得更新地址'
            }
          ]
        }
      ]
    },
    // Category: Credit Cards and Loans 信用卡和贷款
    {
      id: 'credit-cards-loans',
      name: 'Credit Cards and Loans 信用卡和贷款',
      description: '信用卡和贷款信息。',
      helpText: '记录所有信用卡和贷款，包括自动还款设置。',
      items: [
        {
          id: 'credit-card',
          label: '信用卡',
          type: 'group',
          repeatable: true,
          helpText: '添加一张信用卡',
          fields: [
            {
              id: 'issuer',
              label: '发卡机构',
              type: 'text',
              placeholder: '例如：Chase, Citi'
            },
            {
              id: 'card-type',
              label: '卡片类型',
              type: 'text',
              placeholder: '例如：紧急信用卡'
            },
            {
              id: 'credit-limit',
              label: '信用额度',
              type: 'number',
              placeholder: '例如：50000',
              helpText: '请输入数字金额（美元）'
            },
            {
              id: 'apr',
              label: 'APR 利率',
              type: 'text',
              placeholder: '例如：高 APR'
            },
            {
              id: 'auto-pay',
              label: '是否自动还款',
              type: 'checkbox'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：除非必要否则不要使用；如果一个月刷了 50k，月底会从银行账户扣除'
            }
          ]
        },
        {
          id: 'loan',
          label: '贷款',
          type: 'group',
          repeatable: true,
          helpText: '添加一笔贷款',
          fields: [
            {
              id: 'lender',
              label: '贷款机构',
              type: 'text',
              placeholder: '例如：Fak Bank, Fannie Mae'
            },
            {
              id: 'loan-type',
              label: '贷款类型',
              type: 'text',
              placeholder: '例如：汽车贷款、学生贷款'
            },
            {
              id: 'monthly-payment',
              label: '月还款额',
              type: 'number',
              placeholder: '例如：550',
              helpText: '请输入数字金额（美元）'
            },
            {
              id: 'payment-account',
              label: '扣款账户',
              type: 'text',
              placeholder: '例如：从 Fak Bank 自动扣款'
            },
            {
              id: 'payoff-date',
              label: '还清日期',
              type: 'date',
              placeholder: '选择日期',
              helpText: '选择预计还清贷款的日期'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：考虑用保险金提前还清以节省利息'
            }
          ]
        }
      ]
    },
    // Category: Cell Phone and Internet 手机和网络
    {
      id: 'cell-phone-internet',
      name: 'Cell Phone & Internet 手机和网络',
      description: '手机和网络服务账单。',
      helpText: '记录手机和网络服务的支付信息。',
      items: [
        {
          id: 'service',
          label: '服务',
          type: 'group',
          repeatable: true,
          helpText: '添加一个服务',
          fields: [
            {
              id: 'provider',
              label: '服务商',
              type: 'text',
              placeholder: '例如：Orange, Verizon, Comcast'
            },
            {
              id: 'service-type',
              label: '服务类型',
              type: 'select',
              options: [
                { value: 'mobile', label: '手机' },
                { value: 'internet', label: '网络' },
                { value: 'bundle', label: '套餐' }
              ]
            },
            {
              id: 'payment-account',
              label: '支付账户',
              type: 'text',
              placeholder: '例如：从 United States Bank 自动支付'
            },
            {
              id: 'contract-end',
              label: '合同结束日期',
              type: 'date',
              placeholder: '选择日期',
              helpText: '合同到期日期'
            },
            {
              id: 'cancellation-help',
              label: '取消帮助',
              type: 'text',
              placeholder: '例如：Billy Dominguez 可以帮忙用当地语言取消'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea'
            }
          ]
        }
      ]
    },
    // Category: Bill Auto Pay 自动支付账单
    {
      id: 'bill-auto-pay',
      name: 'Bill Auto Pay 自动支付账单',
      description: '设置为自动支付的账单。租金是设置为定期账单的，搬家时记得取消。请朋友帮忙整理这些，因为你可能会忘记。',
      helpText: '记录所有自动支付的账单，以便在需要时取消或更新。',
      items: [
        {
          id: 'auto-pay-bill',
          label: '自动支付账单',
          type: 'group',
          repeatable: true,
          helpText: '添加一个自动支付账单',
          fields: [
            {
              id: 'payee',
              label: '收款方',
              type: 'text',
              placeholder: '例如：State Farm, 电力公司, 房东'
            },
            {
              id: 'description',
              label: '描述',
              type: 'text',
              placeholder: '例如：汽车和房屋保险、电费、租金'
            },
            {
              id: 'amount',
              label: '金额',
              type: 'number',
              placeholder: '例如：100',
              helpText: '请输入数字金额（美元/月）'
            },
            {
              id: 'payment-account',
              label: '支付账户',
              type: 'text',
              placeholder: '例如：United States Bank'
            },
            {
              id: 'payment-type',
              label: '支付类型',
              type: 'select',
              options: [
                { value: 'auto-charge', label: '自动扣款（收款方扣款）' },
                { value: 'recurring-bill-pay', label: '定期账单支付（银行发起）' }
              ]
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：搬家时记得更新地址；搬家时取消定期支付'
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Section 5: Misc 杂项
 * Miscellaneous important information.
 */
const miscSection: Section = {
  id: 'misc',
  name: 'Misc 杂项',
  description: '其他重要信息，包括财务顾问、会计师、安全问题答案和物理安全信息。',
  categories: [
    // Category: Financial Advisor 财务顾问
    {
      id: 'financial-advisor',
      name: 'Financial Advisor 财务顾问',
      description: '财务顾问信息。可以联系他们了解如何投资保险金。',
      helpText: '记录财务顾问的联系方式。',
      items: [
        {
          id: 'advisor',
          label: '财务顾问',
          type: 'group',
          repeatable: true,
          helpText: '添加一个财务顾问',
          fields: [
            {
              id: 'company',
              label: '公司',
              type: 'text',
              placeholder: '例如：Fidelity'
            },
            {
              id: 'contact-name',
              label: '联系人姓名',
              type: 'text',
              placeholder: '例如：John Smith'
            },
            {
              id: 'phone',
              label: '电话',
              type: 'tel'
            },
            {
              id: 'email',
              label: '邮箱',
              type: 'email'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '例如：联系他们了解如何投资保险金'
            }
          ]
        }
      ]
    },
    // Category: Accountant 会计师
    {
      id: 'accountant',
      name: 'Accountant 会计师',
      description: '会计师可以帮助处理很多事情，并提供我可能遗漏的建议。他们了解我们过去10年的财务历史。',
      helpText: '记录会计师的联系方式和相关建议。',
      items: [
        {
          id: 'accountant-info',
          label: '会计师信息',
          type: 'group',
          helpText: '添加会计师的联系信息',
          fields: [
            {
              id: 'name',
              label: '姓名',
              type: 'text',
              placeholder: '例如：Tracey Calendar'
            },
            {
              id: 'email',
              label: '邮箱',
              type: 'email',
              placeholder: '例如：tracey@calendarcpa.com'
            },
            {
              id: 'phone',
              label: '电话',
              type: 'tel'
            }
          ]
        },
        {
          id: 'accountant-notes',
          label: '会计师相关说明',
          type: 'textarea',
          placeholder: '例如：\n• 询问会计师或查看财务记录，看看是否有新的 1099 表格\n• 如果对这一切感到不知所措，可以请她帮忙简化报税方式，不再申请扣除项',
          helpText: '关于会计师的任何建议或说明'
        }
      ]
    },
    // Category: Security Questions 安全问题
    {
      id: 'security-questions',
      name: 'Security Questions 安全问题答案',
      description: '常见安全问题的答案。这些信息非常敏感，请妥善保管。',
      helpText: '记录常见安全问题的答案，以便在需要时恢复账户。',
      items: [
        {
          id: 'security-question',
          label: '安全问题',
          type: 'group',
          repeatable: true,
          helpText: '添加一个安全问题答案',
          fields: [
            {
              id: 'question',
              label: '问题',
              type: 'select',
              options: [
                { value: 'first-pet', label: '第一只宠物的名字' },
                { value: 'fathers-middle-name', label: '父亲的中间名' },
                { value: 'mothers-maiden-name', label: '母亲的婚前姓' },
                { value: 'childhood-street', label: '童年时住的街道' },
                { value: 'first-car', label: '第一辆车' },
                { value: 'first-school', label: '第一所学校' },
                { value: 'custom', label: '自定义问题' }
              ]
            },
            {
              id: 'custom-question',
              label: '自定义问题',
              type: 'text',
              placeholder: '如果选择了自定义问题，请在此输入',
              showWhen: {
                fieldId: 'question',
                value: 'custom'
              }
            },
            {
              id: 'answer',
              label: '答案',
              type: 'password',
              sensitive: true,
              placeholder: '答案'
            }
          ]
        },
        {
          id: 'common-answers',
          label: '常用安全问题答案（快速参考）',
          type: 'group',
          helpText: '快速记录常见安全问题的答案',
          fields: [
            {
              id: 'first-pet',
              label: '第一只宠物的名字',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Jackson'
            },
            {
              id: 'fathers-middle-name',
              label: '父亲的中间名',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Henry'
            },
            {
              id: 'mothers-maiden-name',
              label: '母亲的婚前姓',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Smithe'
            },
            {
              id: 'childhood-street',
              label: '童年时住的街道',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Maine Street'
            },
            {
              id: 'first-car',
              label: '第一辆车',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Toyota Celica'
            },
            {
              id: 'first-school',
              label: '第一所学校',
              type: 'password',
              sensitive: true,
              placeholder: '例如：Menlo Elementary'
            }
          ]
        }
      ]
    },
    // Category: Physical Security 物理安全
    {
      id: 'physical-security',
      name: 'Physical Security 物理安全',
      description: '物理安全设备的密码和组合。',
      helpText: '记录保险箱、药柜、武器柜等的密码。这些信息非常敏感！',
      items: [
        {
          id: 'security-code',
          label: '安全密码',
          type: 'group',
          repeatable: true,
          helpText: '添加一个安全密码',
          fields: [
            {
              id: 'item-name',
              label: '物品名称',
              type: 'text',
              placeholder: '例如：药柜、武器柜、保险箱'
            },
            {
              id: 'code-type',
              label: '密码类型',
              type: 'select',
              options: [
                { value: 'pin', label: 'PIN 码' },
                { value: 'combination', label: '组合锁' },
                { value: 'key-location', label: '钥匙位置' },
                { value: 'other', label: '其他' }
              ]
            },
            {
              id: 'code',
              label: '密码/组合',
              type: 'password',
              sensitive: true,
              placeholder: '例如：59938 或 左-89, 右-33, 转两圈左然后: 51'
            },
            {
              id: 'notes',
              label: '备注',
              type: 'textarea',
              placeholder: '任何额外说明'
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Complete Checklist Structure
 * Combines all sections into the final structure
 */
export const checklistStructure: ChecklistStructure = {
  sections: [
    emergencyContactsSection,
    techSection,
    inputSection,
    outputSection,
    miscSection
  ]
};

/**
 * Helper function to get a section by ID
 */
export function getSectionById(sectionId: string): Section | undefined {
  return checklistStructure.sections.find(s => s.id === sectionId);
}

/**
 * Helper function to get a category by section and category ID
 */
export function getCategoryById(sectionId: string, categoryId: string): Category | undefined {
  const section = getSectionById(sectionId);
  return section?.categories.find(c => c.id === categoryId);
}

/**
 * Helper function to get all categories in order
 */
export function getAllCategoriesInOrder(): Array<{ section: Section; category: Category }> {
  const result: Array<{ section: Section; category: Category }> = [];
  for (const section of checklistStructure.sections) {
    for (const category of section.categories) {
      result.push({ section, category });
    }
  }
  return result;
}

/**
 * Helper function to get total number of categories
 */
export function getTotalCategoryCount(): number {
  return checklistStructure.sections.reduce(
    (total, section) => total + section.categories.length,
    0
  );
}

/**
 * Helper function to get total number of items across all categories
 */
export function getTotalItemCount(): number {
  let count = 0;
  for (const section of checklistStructure.sections) {
    for (const category of section.categories) {
      count += category.items.length;
    }
  }
  return count;
}
