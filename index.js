/**
 * TopHub Stock Monitor
 * 监控热榜话题，匹配上市公司，发送提醒
 * ⚠️ 仅用于信息监控，不构成投资建议
 */

const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

// 品牌 → 上市公司映射表
const BRAND_TO_STOCK = {
  // 科技/互联网
  '苹果': { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' },
  'iPhone': { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' },
  '特斯拉': { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' },
  'Tesla': { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' },
  '英伟达': { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ' },
  'NVIDIA': { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ' },
  '微软': { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ' },
  'Microsoft': { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ' },
  '谷歌': { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ' },
  'Google': { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ' },
  '亚马逊': { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ' },
  'Amazon': { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ' },
  'Meta': { symbol: 'META', name: 'Meta Platforms Inc.', market: 'NASDAQ' },
  'Facebook': { symbol: 'META', name: 'Meta Platforms Inc.', market: 'NASDAQ' },
  '阿里': { symbol: 'BABA', name: 'Alibaba Group', market: 'NYSE' },
  '阿里巴巴': { symbol: 'BABA', name: 'Alibaba Group', market: 'NYSE' },
  '腾讯': { symbol: 'TCEHY', name: 'Tencent Holdings', market: 'OTC' },
  '字节': { symbol: null, name: 'ByteDance', market: 'Private' },
  '抖音': { symbol: null, name: 'ByteDance', market: 'Private' },
  'TikTok': { symbol: null, name: 'ByteDance', market: 'Private' },
  
  // 电动车/新能源
  '小米': { symbol: 'XIACY', name: 'Xiaomi Corp.', market: 'OTC' },
  'Xiaomi': { symbol: 'XIACY', name: 'Xiaomi Corp.', market: 'OTC' },
  '蔚来': { symbol: 'NIO', name: 'NIO Inc.', market: 'NYSE' },
  'NIO': { symbol: 'NIO', name: 'NIO Inc.', market: 'NYSE' },
  '小鹏': { symbol: 'XPEV', name: 'XPeng Inc.', market: 'NYSE' },
  '理想': { symbol: 'LI', name: 'Li Auto Inc.', market: 'NASDAQ' },
  '比亚迪': { symbol: 'BYDDF', name: 'BYD Company', market: 'OTC' },
  
  // AI/芯片
  'OpenAI': { symbol: null, name: 'OpenAI', market: 'Private' },
  'ChatGPT': { symbol: null, name: 'OpenAI', market: 'Private' },
  'AMD': { symbol: 'AMD', name: 'Advanced Micro Devices', market: 'NASDAQ' },
  '英特尔': { symbol: 'INTC', name: 'Intel Corp.', market: 'NASDAQ' },
  'Intel': { symbol: 'INTC', name: 'Intel Corp.', market: 'NASDAQ' },
  
  // 消费品牌
  '耐克': { symbol: 'NKE', name: 'Nike Inc.', market: 'NYSE' },
  'Nike': { symbol: 'NKE', name: 'Nike Inc.', market: 'NYSE' },
  '茅台': { symbol: '600519.SS', name: 'Kweichow Moutai', market: 'SSE' },
  '瑞幸': { symbol: 'LKNCY', name: 'Luckin Coffee', market: 'OTC' },
  '星巴克': { symbol: 'SBUX', name: 'Starbucks Corp.', market: 'NASDAQ' },
  'Starbucks': { symbol: 'SBUX', name: 'Starbucks Corp.', market: 'NASDAQ' },
};

// 爆火信号关键词
const HOT_SIGNALS = [
  '断货', '售罄', '抢购', '排队', '疯了', '爆火', '爆单',
  ' sold out', 'out of stock', 'queue', 'crazy', 'viral',
  '秒光', '抢不到', '加价', '黄牛', '代购'
];

class TopHubMonitor {
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.join(__dirname, 'data');
    this.checkInterval = options.checkInterval || '*/10 * * * *'; // 每10分钟
    this.discordWebhook = options.discordWebhook || null;
    this.seenTopics = new Set();
  }

  async init() {
    // 加载已处理的话题
    try {
      const data = await fs.readFile(path.join(this.dataDir, 'seen_topics.json'), 'utf8');
      const parsed = JSON.parse(data);
      this.seenTopics = new Set(parsed);
      console.log(`[${new Date().toISOString()}] Loaded ${this.seenTopics.size} seen topics`);
    } catch (e) {
      console.log(`[${new Date().toISOString()}] No previous data, starting fresh`);
    }
  }

  async fetchTopHub() {
    try {
      const response = await axios.get('https://tophub.today/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Fetch error:`, error.message);
      return null;
    }
  }

  parseTopics(html) {
    const $ = cheerio.load(html);
    const topics = [];
    
    // 解析热榜条目
    $('.topic-item, .hot-item, .item').each((i, el) => {
      const title = $(el).find('.title, .topic-title, h3, h4').text().trim();
      const heat = $(el).find('.heat, .count, .score').text().trim();
      const link = $(el).find('a').attr('href');
      
      if (title) {
        topics.push({ title, heat, link, timestamp: Date.now() });
      }
    });
    
    return topics;
  }

  analyzeTopic(title) {
    const matches = [];
    
    // 1. 检查是否包含爆火信号词
    const hasHotSignal = HOT_SIGNALS.some(signal => 
      title.toLowerCase().includes(signal.toLowerCase())
    );
    
    // 2. 匹配品牌/公司
    for (const [brand, stock] of Object.entries(BRAND_TO_STOCK)) {
      if (title.includes(brand)) {
        matches.push({
          brand,
          stock,
          hasHotSignal,
          title
        });
      }
    }
    
    return { hasHotSignal, matches };
  }

  generateAlert(matches) {
    if (matches.length === 0) return null;
    
    let alert = {
      type: 'HOT_TOPIC_DETECTED',
      timestamp: new Date().toISOString(),
      topics: matches,
      disclaimer: '⚠️ 此信息仅供参考，不构成投资建议。股市有风险，投资需谨慎。'
    };
    
    return alert;
  }

  async sendNotification(alert) {
    const message = this.formatAlertMessage(alert);
    
    // 打印到控制台
    console.log('\n' + '='.repeat(60));
    console.log(message);
    console.log('='.repeat(60) + '\n');
    
    // 如果配置了 Discord webhook，发送通知
    if (this.discordWebhook) {
      try {
        await axios.post(this.discordWebhook, {
          content: message,
          username: 'TopHub Stock Monitor'
        });
      } catch (e) {
        console.error('Discord webhook failed:', e.message);
      }
    }
    
    // 发送 OpenClaw 消息（如果在 OpenClaw 环境中）
    if (process.env.OPENCLAW_CHANNEL) {
      try {
        const { execSync } = require('child_process');
        execSync(`openclaw message send --channel "${process.env.OPENCLAW_CHANNEL}" --message "${message.substring(0, 1900)}"`, {
          encoding: 'utf8'
        });
      } catch (e) {
        // OpenClaw 命令可能不可用
      }
    }
  }

  formatAlertMessage(alert) {
    let msg = `🚨 **热点监控提醒** 🚨\n\n`;
    msg += `⏰ 时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    alert.topics.forEach((topic, i) => {
      msg += `**${i + 1}. ${topic.title}**\n`;
      msg += `   🏷️ 品牌: ${topic.brand}\n`;
      msg += `   📈 标的: ${topic.stock.symbol || '未上市'} (${topic.stock.name})\n`;
      msg += `   🔥 爆火信号: ${topic.hasHotSignal ? '✅ 是' : '❌ 否'}\n\n`;
    });
    
    msg += `⚠️ ${alert.disclaimer}\n`;
    msg += `💡 建议: 进一步核实信息，查看官方新闻和财报`;
    
    return msg;
  }

  async saveState() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.writeFile(
        path.join(this.dataDir, 'seen_topics.json'),
        JSON.stringify([...this.seenTopics], null, 2)
      );
    } catch (e) {
      console.error('Save state error:', e.message);
    }
  }

  async runOnce() {
    console.log(`[${new Date().toISOString()}] Starting check...`);
    
    const html = await this.fetchTopHub();
    if (!html) return;
    
    const topics = this.parseTopics(html);
    console.log(`[${new Date().toISOString()}] Found ${topics.length} topics`);
    
    const newMatches = [];
    
    for (const topic of topics) {
      // 去重：已处理过的话题跳过
      const topicKey = topic.title.slice(0, 50); // 取前50字符作为key
      if (this.seenTopics.has(topicKey)) continue;
      
      const analysis = this.analyzeTopic(topic.title);
      
      if (analysis.matches.length > 0) {
        newMatches.push(...analysis.matches);
        this.seenTopics.add(topicKey);
      }
    }
    
    if (newMatches.length > 0) {
      const alert = this.generateAlert(newMatches);
      await this.sendNotification(alert);
    } else {
      console.log(`[${new Date().toISOString()}] No new matches`);
    }
    
    await this.saveState();
  }

  start() {
    console.log(`[${new Date().toISOString()}] TopHub Stock Monitor started`);
    console.log(`[${new Date().toISOString()}] Check interval: ${this.checkInterval}`);
    
    // 立即执行一次
    this.runOnce();
    
    // 定时执行
    cron.schedule(this.checkInterval, () => {
      this.runOnce();
    });
  }
}

// 运行监控
async function main() {
  const monitor = new TopHubMonitor({
    checkInterval: '*/10 * * * *', // 每10分钟检查一次
    discordWebhook: process.env.DISCORD_WEBHOOK_URL || null,
  });
  
  await monitor.init();
  monitor.start();
}

// 如果是直接运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TopHubMonitor };
