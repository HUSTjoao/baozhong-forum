/**
 * 检查所有大学的校徽图片
 * 从 universities.ts 中读取所有大学ID并检查对应的校徽文件
 */

const fs = require('fs');
const path = require('path');

// 读取 universities.ts 文件，提取所有大学ID
function getAllUniversityIds() {
  const filePath = path.join(__dirname, '..', 'data', 'universities.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 匹配所有 id: 'xxx' 的模式
  const idMatches = content.matchAll(/id:\s*'([^']+)'/g);
  const ids = Array.from(idMatches, match => match[1]);
  
  return ids;
}

// 读取大学名称（用于显示）
function getUniversityName(id, content) {
  // 找到对应的大学对象
  const regex = new RegExp(`id:\\s*'${id}'[^}]*name:\\s*'([^']+)'`, 's');
  const match = content.match(regex);
  return match ? match[1] : id;
}

function main() {
  const logosDir = path.join(__dirname, '..', 'public', 'logos');
  const dataFile = path.join(__dirname, '..', 'data', 'universities.ts');
  const content = fs.readFileSync(dataFile, 'utf8');
  
  if (!fs.existsSync(logosDir)) {
    console.log('❌ logos 目录不存在');
    return;
  }
  
  const allIds = getAllUniversityIds();
  const existing = [];
  const missing = [];
  
  for (const id of allIds) {
    const filepath = path.join(logosDir, `${id}.png`);
    const name = getUniversityName(id, content);
    
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 100) {
        existing.push({ id, name, size: stats.size });
      } else {
        missing.push({ id, name, reason: '文件损坏或太小' });
      }
    } else {
      missing.push({ id, name, reason: '文件不存在' });
    }
  }
  
  console.log('='.repeat(80));
  console.log('所有大学校徽检查结果');
  console.log('='.repeat(80));
  console.log(`\n✅ 已存在: ${existing.length} 个`);
  console.log(`❌ 缺失: ${missing.length} 个`);
  
  if (missing.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('缺失的校徽文件列表（按ID排序）：');
    console.log('='.repeat(80));
    console.log('\n格式：文件名.png - 大学名称\n');
    
    // 按ID排序
    missing.sort((a, b) => a.id.localeCompare(b.id));
    
    missing.forEach(({ id, name }) => {
      console.log(`${id}.png - ${name}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('缺失的文件名列表（可直接复制）：');
    console.log('='.repeat(80));
    const fileNames = missing.map(({ id }) => `${id}.png`).join('\n');
    console.log(fileNames);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('下载建议：');
  console.log('1. 访问 https://www.urongda.com/download');
  console.log('2. 下载上述缺失大学的校徽图片');
  console.log('3. 重命名为对应的文件名（如 afmu.png）');
  console.log('4. 放入 public/logos/ 目录');
  console.log('='.repeat(80));
}

main();


