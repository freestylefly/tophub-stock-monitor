/**
 * 测试脚本 - 模拟检测
 */

const { TopHubMonitor } = require('./index');

// 模拟测试数据
const testCases = [
  'iPhone 16 Pro 断货了！官网排队到3个月',
  '特斯拉 Model Y 降价，门店排队疯了',
  '小米汽车发布，10万台秒光',
  'OpenAI 发布 GPT-5，服务器崩溃',
  'NVIDIA 显卡售罄，黄牛加价三倍',
  '今天天气真好', // 应该不匹配
  '瑞幸咖啡新品爆单，门店排队', 
  '抖音某网红带货，产品秒光'
];

console.log('🧪 TopHub Stock Monitor 测试\n');
console.log('='.repeat(60));

testCases.forEach((title, i) => {
  console.log(`\n测试 ${i + 1}: ${title}`);
  
  const monitor = new TopHubMonitor();
  const analysis = monitor.analyzeTopic(title);
  
  if (analysis.matches.length > 0) {
    console.log('✅ 匹配结果:');
    analysis.matches.forEach(m => {
      console.log(`   - 品牌: ${m.brand}`);
      console.log(`   - 股票: ${m.stock.symbol || '未上市'} (${m.stock.name})`);
      console.log(`   - 爆火: ${m.hasHotSignal ? '是' : '否'}`);
    });
  } else {
    console.log('❌ 无匹配');
  }
});

console.log('\n' + '='.repeat(60));
console.log('测试完成');
