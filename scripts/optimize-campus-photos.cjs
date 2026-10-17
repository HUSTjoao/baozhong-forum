// Pre-compress the existing photos; visitors do not trigger server-side transcoding.
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const sources = ['home-campus-blossoms-clean.png', 'home-campus-bench.jpg', 'campus/sunlit-path.jpg', 'campus/ginkgo-leaves.jpg', 'campus/window-tree.jpg', 'campus/green-sky.jpg'];
async function main() {
  await fs.mkdir(path.join(root, 'public/optimized-campus'), { recursive: true });
  const manifest = {};
  for (const source of sources) {
    const bytes = await fs.readFile(path.join(root, 'public', source));
    const metadata = await sharp(bytes).metadata();
    const variants = [];
    for (const width of [...new Set([Math.min(800, metadata.width), Math.min(1280, metadata.width), Math.min(1920, metadata.width)])]) {
      const { data, info } = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 3 }).toBuffer({ resolveWithObject: true });
      const hash = createHash('sha256').update(data).digest('hex').slice(0, 12);
      const src = `/optimized-campus/${path.parse(source).name}-${info.width}-${hash}.webp`;
      await fs.writeFile(path.join(root, 'public', src), data);
      variants.push({ src, width: info.width, bytes: data.length });
    }
    const placeholder = await sharp(bytes).rotate().resize({ width: 40 }).webp({ quality: 35 }).toBuffer();
    manifest['/' + source] = { src: variants.at(-1).src, thumbnail: variants[0].src, srcSet: variants.map(image => `${image.src} ${image.width}w`).join(', '), placeholder: 'data:image/webp;base64,' + placeholder.toString('base64') };
    console.log(source, JSON.stringify(variants.map(image => ({ width: image.width, bytes: image.bytes }))));
  }
  await fs.writeFile(path.join(root, 'data/optimized-campus-photos.json'), JSON.stringify(manifest, null, 2) + '\n');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
