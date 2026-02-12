---
name: tophub-stock-monitor
description: Monitor TopHub hot topics and alert when brands/companies show viral signals. Maps hot topics to listed companies for stock monitoring.
---

# TopHub Stock Monitor

监控今日热榜(https://tophub.today/)话题，当检测到品牌/产品爆火信号时，自动匹配对应上市公司并发送提醒。

⚠️ **免责声明**: 此工具仅用于信息监控，**不构成投资建议**。股市有风险，投资需谨慎。

## 功能

- 🔍 定时抓取 TopHub 热榜
- 🔥 检测爆火信号词（断货、售罄、排队、疯抢等）
- 🏢 自动匹配品牌 → 上市公司
- 📢 发送 Discord/OpenClaw 通知
- 🗄️ 去重机制，避免重复提醒

## 安装

```bash
cd /root/.openclaw/workspace/skills/tophub-stock-monitor
npm install
```

## 配置

### 环境变量

```bash
# Discord Webhook（可选，用于接收通知）
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# OpenClaw 频道（可选，用于发送消息）
export OPENCLAW_CHANNEL="#your-channel"
```

### 品牌映射表

编辑 `index.js` 中的 `BRAND_TO_STOCK` 对象添加更多品牌映射。

## 使用

### 手动运行

```bash
npm start
```

### 集成到 OpenClaw

```bash
# 添加到 cron 定时任务
cron action:add job:{
  "name": "tophub-stock-monitor",
  "schedule": {"kind": "every", "everyMs": 600000},
  "payload": {"kind": "agentTurn", "message": "运行 TopHub 股票监控"}
}
```

## 爆火信号词

当前监控的信号：
- 断货、售罄、抢购、排队、疯了、爆火、爆单
- sold out, out of stock, queue, crazy, viral
- 秒光、抢不到、加价、黄牛、代购

## 输出示例

```
🚨 热点监控提醒 🚨

⏰ 时间: 2026/2/12 23:30:45

1. iPhone 16 Pro Max 断货了！
   🏷️ 品牌: iPhone
   📈 标的: AAPL (Apple Inc.)
   🔥 爆火信号: ✅ 是

⚠️ 此信息仅供参考，不构成投资建议。
💡 建议: 进一步核实信息，查看官方新闻和财报
```

## 注意事项

1. **延迟问题**: 从"爆火"到"股价反应"可能有延迟，机构可能更快
2. **误判风险**: 热榜话题可能与股票无关
3. **反爬限制**: 频繁抓取可能导致 IP 被封
4. **仅作提醒**: 所有投资决策请自行判断

## 扩展

可以添加更多数据源：
- 微博热搜
- 小红书热门
- 抖音热榜
- Twitter Trending

## 技术栈

- Node.js
- Axios (HTTP请求)
- Cheerio (HTML解析)
- node-cron (定时任务)

## License

MIT
