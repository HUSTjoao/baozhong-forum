/**
 * 检查校徽图片脚本
 * 检查哪些大学的校徽已存在，哪些缺失
 */

const fs = require('fs');
const path = require('path');

// 从 universities.ts 中读取所有大学ID
// 这里列出所有主要大学的ID
const allUniversityIds = [
  // 985大学
  'pku', 'tsinghua', 'fudan', 'sjtu', 'zju', 'nju', 'ustc', 'xju', 'hit', 'bit',
  'nankai', 'tju', 'seu', 'whu', 'hust', 'sysu', 'scut', 'scu', 'uestc', 'cqu',
  'sdu', 'ouc', 'jlu', 'dlut', 'neu', 'hnu', 'csu', 'xmu', 'lzu', 'ruc',
  'buaa', 'bnu', 'muc', 'ecnu', 'tongji', 'cau', 'nwpu', 'nwafu', 'nudt',
  
  // 211和其他知名大学
  'xidian', 'snnu', 'nwu', 'chd', 'bupt', 'cufe', 'uibe', 'bfsu', 'cuc',
  'cugb', 'cup', 'cug', 'njust', 'nuaa', 'hhu', 'suda', 'njnu', 'hustc', 'swufe',
];

function main() {
  const logosDir = path.join(__dirname, '..', 'public', 'logos');
  
  if (!fs.existsSync(logosDir)) {
    console.log('❌ logos 目录不存在');
    return;
  }
  
  const existing = [];
  const missing = [];
  
  for (const id of allUniversityIds) {
    const filepath = path.join(logosDir, `${id}.png`);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 100) {
        existing.push({ id, size: stats.size });
      } else {
        missing.push({ id, reason: '文件损坏或太小' });
      }
    } else {
      missing.push({ id, reason: '文件不存在' });
    }
  }
  
  console.log('='.repeat(60));
  console.log('校徽图片检查结果');
  console.log('='.repeat(60));
  console.log(`\n✅ 已存在: ${existing.length} 个`);
  existing.forEach(({ id, size }) => {
    console.log(`   - ${id}.png (${(size / 1024).toFixed(1)} KB)`);
  });
  
  console.log(`\n❌ 缺失: ${missing.length} 个`);
  missing.forEach(({ id, reason }) => {
    console.log(`   - ${id}.png (${reason})`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('下载建议：');
  console.log('1. 访问 https://www.urongda.com/download');
  console.log('2. 下载缺失大学的校徽图片');
  console.log('3. 重命名为对应的ID（如 tsinghua.png）');
  console.log('4. 放入 public/logos/ 目录');
  console.log('='.repeat(60));
}

main();


