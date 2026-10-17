// Build-time assets only: original artwork stays unchanged; no runtime image conversion.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
async function variants(input, sizes) {
  const bytes = await fs.readFile(path.join(root, 'public', input));
  const name = path.parse(input).name;
  const output = {};
  for (const size of sizes) {
    const image = await sharp(bytes).rotate().resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88, effort: 2 }).toBuffer();
    const hash = createHash('sha256').update(image).digest('hex').slice(0, 12);
    const target = `/optimized-logos/${name}-${size}-${hash}.webp`;
    await fs.writeFile(path.join(root, 'public', target), image);
    output[size] = target;
  }
  return output;
}
async function main() {
  await fs.mkdir(path.join(root, 'public/optimized-logos'), { recursive: true });
  const school = await variants('baoji-school-emblem.png', [96, 192, 384]);
  const universities = {};
  for (const entry of (await fs.readdir(path.join(root, 'public/logos'))).sort()) {
    if (!/\.(png|jpe?g|webp)$/i.test(entry)) continue;
    universities['/logos/' + entry] = await variants('logos/' + entry, [192, 420]);
  }
  await fs.writeFile(path.join(root, 'data/optimized-school-emblem.json'), JSON.stringify(school, null, 2) + '\n');
  await fs.writeFile(path.join(root, 'data/optimized-university-logos.json'), JSON.stringify(universities, null, 2) + '\n');
  console.log(`已生成导航校徽及 ${Object.keys(universities).length} 所大学的缩略图和详情图。`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
