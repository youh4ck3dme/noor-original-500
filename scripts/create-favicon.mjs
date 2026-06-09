import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const appDir = join(rootDir, 'app');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#111827"/>
  <circle cx="16" cy="16" r="9" fill="#10b981"/>
</svg>`;

mkdirSync(publicDir, { recursive: true });
mkdirSync(appDir, { recursive: true });

const buffer = Buffer.from(svg);

await sharp(buffer).resize(32, 32).png().toFile(join(publicDir, 'favicon.ico'));
await sharp(buffer).resize(32, 32).png().toFile(join(appDir, 'icon.png'));

console.log('Created public/favicon.ico and app/icon.png');
