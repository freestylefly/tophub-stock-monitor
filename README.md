# 🚀 TopHub Stock Monitor

> 实时监控热榜话题，发现品牌爆火信号，智能匹配上市公司股票代码

[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-blue?style=flat&logo=github)](https://github.com/freestylefly/tophub-stock-monitor)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 项目介绍

**TopHub Stock Monitor** 是一个智能监控工具，专门用于：

- 🔍 **监控** [今日热榜](https://tophub.today/) 的实时话题
- 🔥 **检测** 品牌/产品的爆火信号（断货、售罄、排队疯抢等）
- 🏢 **匹配** 品牌对应的上市公司股票代码
- 📢 **推送** 即时通知到 Discord/OpenClaw

### 核心用途

帮助投资者/分析师**第一时间发现**可能引发股价波动的消费热点事件，例如：

- iPhone 新品断货 → 关注 AAPL
- 特斯拉降价排队 → 关注 TSLA
- 小米汽车秒光 → 关注 XIACY
- 瑞幸咖啡爆单 → 关注 LKNCY

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| ⏰ **定时监控** | 每10分钟自动抓取 TopHub 热榜 |
| 🔥 **爆火检测** | 识别"断货""售罄""排队疯了"等20+信号词 |
| 🏢 **股票匹配** | 自动映射品牌→上市公司→股票代码 |
| 🗄️ **智能去重** | 避免同一话题重复提醒 |
| 📢 **即时通知** | 支持 Discord Webhook 和 OpenClaw 消息 |
| 📝 **详细日志** | 完整的运行日志和错误处理 |

### 支持的品牌映射

目前已支持 **30+** 知名品牌：

- **科技**: Apple、Tesla、NVIDIA、Microsoft、Google、Meta、OpenAI
- **中国公司**: 阿里、腾讯、字节、小米、蔚来、小鹏、理想、比亚迪
- **消费**: 耐克、茅台、瑞幸、星巴克

---

## 🛠️ 安装部署

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆仓库
git clone https://github.com/freestylefly/tophub-stock-monitor.git
cd tophub-stock-monitor

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR_WEBHOOK_URL"
```

---

## 🚀 使用方法

### 方式一：直接运行

```bash
npm start
```

### 方式二：手动测试

```bash
node test.js
```

### 方式三：集成到 OpenClaw

添加定时任务：

```bash
openclaw cron add --name "tophub-monitor" \
  --schedule "*/10 * * * *" \
  --command "cd /path/to/tophub-stock-monitor && npm start"
```

### 方式四：后台运行

```bash
# 使用 pm2
npm install -g pm2
pm2 start index.js --name tophub-monitor

# 或使用 nohup
nohup npm start > monitor.log 2>&1 &
```

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DISCORD_WEBHOOK_URL` | Discord 通知 Webhook URL | 可选 |
| `OPENCLAW_CHANNEL` | OpenClaw 目标频道 | 可选 |
| `CHECK_INTERVAL` | 检查间隔（cron 格式，默认 `*/10 * * * *`） | 可选 |

### 修改品牌映射

编辑 `index.js` 中的 `BRAND_TO_STOCK` 对象：

```javascript
const BRAND_TO_STOCK = {
  '你的品牌': { symbol: 'STOCK', name: 'Company Name', market: 'NYSE' },
  // ... 添加更多
};
```

### 修改爆火信号词

编辑 `HOT_SIGNALS` 数组添加自定义信号：

```javascript
const HOT_SIGNALS = [
  '断货', '售罄', '抢购', '排队', '疯了',
  // ... 添加更多
];
```

---

## 📊 输出示例

### 控制台输出

```
[2026-02-12T23:10:28.123Z] TopHub Stock Monitor started
[2026-02-12T23:10:28.456Z] Check interval: */10 * * * *
[2026-02-12T23:10:29.789Z] Starting check...
[2026-02-12T23:10:30.234Z] Found 50 topics
[2026-02-12T23:10:30.567Z] No new matches
```

### 检测到热点时的通知

```
🚨 热点监控提醒 🚨

⏰ 时间: 2026/2/12 23:30:45

1. iPhone 16 Pro 断货了！官网排队到3个月
   🏷️ 品牌: iPhone
   📈 标的: AAPL (Apple Inc.)
   🔥 爆火信号: ✅ 是

2. 特斯拉 Model Y 降价，门店排队疯了
   🏷️ 品牌: 特斯拉
   📈 标的: TSLA (Tesla Inc.)
   🔥 爆火信号: ✅ 是

⚠️ 此信息仅供参考，不构成投资建议。
💡 建议: 进一步核实信息，查看官方新闻和财报
```

---

## 🧪 测试

运行测试脚本验证功能：

```bash
npm test
```

测试用例包括：
- iPhone 断货检测
- 特斯拉降价排队
- 小米汽车秒光
- NVIDIA 显卡售罄
- 正常话题过滤

---

## 📁 项目结构

```
tophub-stock-monitor/
├── index.js          # 主程序入口
├── package.json      # 项目配置
├── test.js           # 测试脚本
├── SKILL.md          # Skill 文档
├── README.md         # 本文件
└── data/             # 数据存储目录
    └── seen_topics.json  # 已处理话题记录
```

---

## ⚠️ 免责声明

**重要提示：**

1. **本工具仅供信息监控，不构成投资建议**
2. **股市有风险，投资需谨慎**
3. **热榜信息到股价反应可能存在延迟或无关**
4. **所有投资决策请自行判断并承担风险**

**已知限制：**
- 从"爆火"到"股价反应"可能有时间差
- 机构交易速度远快于个人
- 部分话题可能与股票无关
- 网站反爬可能导致数据获取失败

---

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

### 添加新品牌

如果你发现监控的品牌不在列表中，请提交 PR 添加：

```javascript
// 在 BRAND_TO_STOCK 中添加
'品牌名': { 
  symbol: '股票代码', 
  name: '公司全称', 
  market: '交易所' 
}
```

### 报告问题

请提供：
- 错误信息
- 运行环境（Node.js 版本、操作系统）
- 复现步骤

---

## 📈 后续规划

- [ ] 添加更多数据源（微博热搜、小红书、抖音热榜）
- [ ] 支持情绪分析（正面/负面）
- [ ] 添加历史数据统计
- [ ] 支持邮件/短信通知
- [ ] Web 管理界面

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [今日热榜](https://tophub.today/) - 数据源
- [OpenClaw](https://openclaw.ai/) - 运行平台
- [fal.ai](https://fal.ai/) - 图像生成支持

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/freestylefly">OpenClaw AI Agent</a>
</p>

<p align="center">
  <a href="https://github.com/freestylefly/tophub-stock-monitor/stargazers">
    <img src="https://img.shields.io/github/stars/freestylefly/tophub-stock-monitor?style=social" alt="Stars">
  </a>
</p>
