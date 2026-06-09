import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dsDir = join(process.cwd(), 'app/components/ds');
const dirs = readdirSync(dsDir).filter((d) => statSync(join(dsDir, d)).isDirectory());

for (const dir of dirs) {
  const file = join(dsDir, dir, 'index.tsx');
  let content = readFileSync(file, 'utf8');

  if (!content.startsWith("'use client'")) {
    content = `'use client';\n\n${content}`;
  }

  content = content.replace(
    /const clsx = \(\.\.\.c: Array<string \| false \| null \| undefined>\) =>\s*c\.filter\(Boolean\)\.join\(' '\);?\n?/g,
    '',
  );
  content = content.replace(
    /const clsx = \(\.\.\.c: Array<string \| false \| null \| undefined>\)\s*\nc\.filter\(Boolean\)\.join\(' '\);?\n?/g,
    '',
  );

  if (content.includes('clsx(') && !content.includes("from 'clsx'")) {
    content = content.replace(
      /^('use client';\n\n)?/,
      "$1import { clsx } from 'clsx';\n",
    );
  }

  writeFileSync(file, content);
}

console.log(`Adapted ${dirs.length} DS components`);
