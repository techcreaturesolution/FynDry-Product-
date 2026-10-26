import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('src/assets/Images');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') && !f.endsWith('.opt.png'));

console.log(`Optimizing ${files.length} images in ${dir}...`);

for (const file of files) {
  const inputPath = path.join(dir, file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const webpPath = path.join(dir, `${base}.webp`);
  const optPngPath = path.join(dir, `${base}.opt.png`);

  const stat = fs.statSync(inputPath);
  console.log(`Original ${file}: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

  // Generate WebP
  await sharp(inputPath)
    .resize(900, 900, { fit: 'inside' })
    .webp({ quality: 85, effort: 4 })
    .toFile(webpPath);

  const webpStat = fs.statSync(webpPath);
  console.log(` -> WebP ${base}.webp: ${(webpStat.size / 1024).toFixed(1)} KB`);

  // Also optimize PNG inplace by replacing with compressed 900x900 PNG
  await sharp(inputPath)
    .resize(900, 900, { fit: 'inside' })
    .png({ quality: 85, compressionLevel: 8 })
    .toFile(optPngPath);

  // Replace original with optimized png
  fs.unlinkSync(inputPath);
  fs.renameSync(optPngPath, inputPath);

  const newStat = fs.statSync(inputPath);
  console.log(` -> Optimized PNG: ${(newStat.size / 1024).toFixed(1)} KB (Saved ${((1 - newStat.size / stat.size) * 100).toFixed(1)}%)\n`);
}

console.log('All listing images in src/assets/Images optimized successfully!');
