const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'dist', 'public');
const distDir = path.join(root, 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  if (!fs.existsSync(publicDir)) {
    console.log('No public dir to move:', publicDir);
    process.exit(0);
  }

  console.log('Copying', publicDir, '->', distDir);
  copyRecursive(publicDir, distDir);

  console.log('Done copying public to dist');
} catch (err) {
  console.error('Error copying public to dist', err);
  process.exit(1);
}
