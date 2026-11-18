import fs from 'node:fs';
import path from 'node:path';

const binPath = path.resolve('node_modules/wrangler/bin/wrangler.js');
if (fs.existsSync(binPath)) {
  let content = fs.readFileSync(binPath, 'utf8');
  // Reset if previously patched
  const shimPattern = /\/\/ FACE-DAY SHIM[\s\S]*?\.\.\.process\.argv\.slice\(2\)\),/;
  if (shimPattern.test(content)) {
    content = content.replace(shimPattern, '...process.argv.slice(2),');
  }
  const target = '...process.argv.slice(2),';
  const replacement = `// FACE-DAY SHIM\n\t\t\t...(process.argv[2] === 'deploy' && !process.argv.includes('pages') ? ['pages', 'deploy', 'dist', '--project-name=face-day', ...process.argv.slice(3)] : process.argv.slice(2)),`;
  content = content.replace(target, replacement);
  fs.writeFileSync(binPath, content, 'utf8');
  console.log('[Face Day] Applied Wrangler Pages deployment shim with --project-name=face-day.');
}
