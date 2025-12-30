/**
 * 大学校徽下载脚本（改进版）
 * 
 * 使用方法：
 * npm run download-logos
 * 
 * 注意：由于在线资源可能受限，如果自动下载失败，
 * 建议从 https://www.urongda.com/download 手动下载
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 大学ID到校徽图片URL的映射
// 使用多个备用源，提高成功率
const logoUrlMap = {
  // 主要985大学
  'pku': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/1/1f/Peking_University_Seal.svg/200px-Peking_University_Seal.svg.png',
    'https://www.pku.edu.cn/images/pku_logo.png', // 备用
  ],
  'tsinghua': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/9/90/Tsinghua_University_Seal.svg/200px-Tsinghua_University_Seal.svg.png',
    'https://www.tsinghua.edu.cn/__local/0/00/00/logo.png', // 备用
  ],
  'fudan': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4a/Fudan_University_Seal.svg/200px-Fudan_University_Seal.svg.png',
  ],
  'sjtu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8c/Shanghai_Jiao_Tong_University_Seal.svg/200px-Shanghai_Jiao_Tong_University_Seal.svg.png',
  ],
  'zju': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5f/Zhejiang_University_Seal.svg/200px-Zhejiang_University_Seal.svg.png',
  ],
  'nju': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6e/Nanjing_University_Seal.svg/200px-Nanjing_University_Seal.svg.png',
  ],
  'ustc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/7/7e/University_of_Science_and_Technology_of_China_Seal.svg/200px-University_of_Science_and_Technology_of_China_Seal.svg.png',
  ],
  'xju': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/0/0c/Xi%27an_Jiaotong_University_Seal.svg/200px-Xi%27an_Jiaotong_University_Seal.svg.png',
  ],
  'hit': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Harbin_Institute_of_Technology_Seal.svg/200px-Harbin_Institute_of_Technology_Seal.svg.png',
  ],
  'bit': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/1/1a/Beijing_Institute_of_Technology_Seal.svg/200px-Beijing_Institute_of_Technology_Seal.svg.png',
  ],
  'nankai': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4c/Nankai_University_Seal.svg/200px-Nankai_University_Seal.svg.png',
  ],
  'tju': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5a/Tianjin_University_Seal.svg/200px-Tianjin_University_Seal.svg.png',
  ],
  'seu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/9/9e/Southeast_University_Seal.svg/200px-Southeast_University_Seal.svg.png',
  ],
  'whu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/2/2e/Wuhan_University_Seal.svg/200px-Wuhan_University_Seal.svg.png',
  ],
  'hust': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8d/Huazhong_University_of_Science_and_Technology_Seal.svg/200px-Huazhong_University_of_Science_and_Technology_Seal.svg.png',
  ],
  'sysu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/3/3a/Sun_Yat-sen_University_Seal.svg/200px-Sun_Yat-sen_University_Seal.svg.png',
  ],
  'scut': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/South_China_University_of_Technology_Seal.svg/200px-South_China_University_of_Technology_Seal.svg.png',
  ],
  'scu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Sichuan_University_Seal.svg/200px-Sichuan_University_Seal.svg.png',
  ],
  'uestc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/9/9e/University_of_Electronic_Science_and_Technology_of_China_Seal.svg/200px-University_of_Electronic_Science_and_Technology_of_China_Seal.svg.png',
  ],
  'cqu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5c/Chongqing_University_Seal.svg/200px-Chongqing_University_Seal.svg.png',
  ],
  'sdu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Shandong_University_Seal.svg/200px-Shandong_University_Seal.svg.png',
  ],
  'ouc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/0/0e/Ocean_University_of_China_Seal.svg/200px-Ocean_University_of_China_Seal.svg.png',
  ],
  'jlu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/3/3a/Jilin_University_Seal.svg/200px-Jilin_University_Seal.svg.png',
  ],
  'dlut': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Dalian_University_of_Technology_Seal.svg/200px-Dalian_University_of_Technology_Seal.svg.png',
  ],
  'neu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Northeastern_University_Seal.svg/200px-Northeastern_University_Seal.svg.png',
  ],
  'hnu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Hunan_University_Seal.svg/200px-Hunan_University_Seal.svg.png',
  ],
  'csu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/9/9e/Central_South_University_Seal.svg/200px-Central_South_University_Seal.svg.png',
  ],
  'xmu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/7/7e/Xiamen_University_Seal.svg/200px-Xiamen_University_Seal.svg.png',
  ],
  'lzu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Lanzhou_University_Seal.svg/200px-Lanzhou_University_Seal.svg.png',
  ],
  'ruc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Renmin_University_of_China_Seal.svg/200px-Renmin_University_of_China_Seal.svg.png',
  ],
  'buaa': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Beihang_University_Seal.svg/200px-Beihang_University_Seal.svg.png',
  ],
  'bnu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Beijing_Normal_University_Seal.svg/200px-Beijing_Normal_University_Seal.svg.png',
  ],
  'muc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Minzu_University_of_China_Seal.svg/200px-Minzu_University_of_China_Seal.svg.png',
  ],
  'ecnu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/East_China_Normal_University_Seal.svg/200px-East_China_Normal_University_Seal.svg.png',
  ],
  'tongji': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Tongji_University_Seal.svg/200px-Tongji_University_Seal.svg.png',
  ],
  'cau': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/China_Agricultural_University_Seal.svg/200px-China_Agricultural_University_Seal.svg.png',
  ],
  'nwpu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/Northwestern_Polytechnical_University_Seal.svg/200px-Northwestern_Polytechnical_University_Seal.svg.png',
  ],
  'nwafu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/Northwest_A%26F_University_Seal.svg/200px-Northwest_A%26F_University_Seal.svg.png',
  ],
  'nudt': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/National_University_of_Defense_Technology_Seal.svg/200px-National_University_of_Defense_Technology_Seal.svg.png',
  ],
  
  // 211和其他知名大学
  'xidian': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/9/9e/Xidian_University_Seal.svg/200px-Xidian_University_Seal.svg.png',
  ],
  'snnu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Shaanxi_Normal_University_Seal.svg/200px-Shaanxi_Normal_University_Seal.svg.png',
  ],
  'nwu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/Northwest_University_Seal.svg/200px-Northwest_University_Seal.svg.png',
  ],
  'chd': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Chang%27an_University_Seal.svg/200px-Chang%27an_University_Seal.svg.png',
  ],
  'bupt': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Beijing_University_of_Posts_and_Telecommunications_Seal.svg/200px-Beijing_University_of_Posts_and_Telecommunications_Seal.svg.png',
  ],
  'cufe': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Central_University_of_Finance_and_Economics_Seal.svg/200px-Central_University_of_Finance_and_Economics_Seal.svg.png',
  ],
  'uibe': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/7/7e/University_of_International_Business_and_Economics_Seal.svg/200px-University_of_International_Business_and_Economics_Seal.svg.png',
  ],
  'bfsu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/Beijing_Foreign_Studies_University_Seal.svg/200px-Beijing_Foreign_Studies_University_Seal.svg.png',
  ],
  'cuc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Communication_University_of_China_Seal.svg/200px-Communication_University_of_China_Seal.svg.png',
  ],
  'cugb': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/China_University_of_Geosciences_Beijing_Seal.svg/200px-China_University_of_Geosciences_Beijing_Seal.svg.png',
  ],
  'cup': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/China_University_of_Petroleum_Beijing_Seal.svg/200px-China_University_of_Petroleum_Beijing_Seal.svg.png',
  ],
  'cug': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/4/4d/China_University_of_Geosciences_Wuhan_Seal.svg/200px-China_University_of_Geosciences_Wuhan_Seal.svg.png',
  ],
  'njust': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/Nanjing_University_of_Science_and_Technology_Seal.svg/200px-Nanjing_University_of_Science_and_Technology_Seal.svg.png',
  ],
  'nuaa': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Nanjing_University_of_Aeronautics_and_Astronautics_Seal.svg/200px-Nanjing_University_of_Aeronautics_and_Astronautics_Seal.svg.png',
  ],
  'hhu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Hohai_University_Seal.svg/200px-Hohai_University_Seal.svg.png',
  ],
  'suda': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Soochow_University_Seal.svg/200px-Soochow_University_Seal.svg.png',
  ],
  'njnu': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/6/6c/Nanjing_Normal_University_Seal.svg/200px-Nanjing_Normal_University_Seal.svg.png',
  ],
  'hustc': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/8/8e/Central_China_Normal_University_Seal.svg/200px-Central_China_Normal_University_Seal.svg.png',
  ],
  'swufe': [
    'https://upload.wikimedia.org/wikipedia/zh/thumb/5/5e/Southwestern_University_of_Finance_and_Economics_Seal.svg/200px-Southwestern_University_of_Finance_and_Economics_Seal.svg.png',
  ],
};

// 下载图片的函数（改进版，添加请求头）
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': urlObj.origin,
          'Connection': 'keep-alive',
        },
        timeout: 15000,
      };
      
      const request = protocol.request(options, (response) => {
        // 处理重定向
        if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
          request.destroy();
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            const absoluteUrl = redirectUrl.startsWith('http') 
              ? redirectUrl 
              : `${urlObj.protocol}//${urlObj.hostname}${redirectUrl}`;
            return downloadImage(absoluteUrl, filepath)
              .then(resolve)
              .catch(reject);
          }
        }
        
        if (response.statusCode !== 200) {
          request.destroy();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        const fileStream = fs.createWriteStream(filepath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          // 检查文件大小，如果太小可能是错误页面
          const stats = fs.statSync(filepath);
          if (stats.size < 100) {
            fs.unlinkSync(filepath);
            reject(new Error('File too small, likely an error page'));
          } else {
            resolve();
          }
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      });
      
      request.on('error', (err) => {
        reject(err);
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
      
      request.end();
    } catch (error) {
      reject(error);
    }
  });
}

// 尝试从多个URL下载
async function downloadWithFallback(id, urls, filepath) {
  if (!Array.isArray(urls)) {
    urls = [urls];
  }
  
  for (let i = 0; i < urls.length; i++) {
    try {
      await downloadImage(urls[i], filepath);
      return { success: true, url: urls[i], attempt: i + 1 };
    } catch (error) {
      if (i === urls.length - 1) {
        // 最后一个URL也失败了
        return { success: false, error: error.message, attempts: urls.length };
      }
      // 继续尝试下一个URL
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// 主函数
async function main() {
  const logosDir = path.join(__dirname, '..', 'public', 'logos');
  
  // 确保目录存在
  if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
    console.log(`创建目录: ${logosDir}`);
  }
  
  console.log('开始下载大学校徽图片...\n');
  console.log(`目标目录: ${logosDir}\n`);
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;
  const failed = [];
  
  for (const [id, urls] of Object.entries(logoUrlMap)) {
    const filepath = path.join(logosDir, `${id}.png`);
    
    // 如果文件已存在，询问是否跳过
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 100) {
        console.log(`⏭  ${id}.png 已存在 (${stats.size} bytes)，跳过`);
        skipCount++;
        continue;
      } else {
        // 文件太小，可能是损坏的，删除后重新下载
        fs.unlinkSync(filepath);
        console.log(`⚠  ${id}.png 文件损坏，将重新下载`);
      }
    }
    
    process.stdout.write(`⬇  正在下载 ${id}... `);
    const result = await downloadWithFallback(id, urls, filepath);
    
    if (result.success) {
      const stats = fs.statSync(filepath);
      console.log(`✓ 成功 (${stats.size} bytes, 尝试 ${result.attempt}/${urls.length})`);
      successCount++;
    } else {
      console.log(`✗ 失败: ${result.error} (尝试了 ${result.attempts} 个URL)`);
      failCount++;
      failed.push(id);
    }
    
    // 添加延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`下载完成！`);
  console.log(`成功: ${successCount} 个`);
  console.log(`跳过: ${skipCount} 个`);
  console.log(`失败: ${failCount} 个`);
  
  if (failed.length > 0) {
    console.log(`\n失败的大学ID (${failed.length}个):`);
    console.log(failed.join(', '));
  }
  
  console.log(`\n提示：`);
  console.log(`1. 如果某些图片下载失败，可以访问以下网站手动下载：`);
  console.log(`   - https://www.urongda.com/download (提供2960所大学校徽)`);
  console.log(`   - https://nav.weyondesign.com/sites/1567.html (矢量校徽)`);
  console.log(`2. 将下载的图片重命名为对应的大学ID（如 pku.png）`);
  console.log(`3. 放入 ${logosDir} 目录`);
  console.log(`4. 图片格式建议：PNG，尺寸：200x200 或更高`);
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadImage, downloadWithFallback, logoUrlMap };
