const fs = require('fs');
const path = require('path');

// 获取命令行传入的 profile，默认为 'dev'
const profile = process.argv[2] || 'dev';
const sourceFile = path.join(__dirname, `.env.${profile}`);
const targetFile = path.join(__dirname, '.env.local');

if (fs.existsSync(sourceFile)) {
  try {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('\x1b[32m%s\x1b[0m', `[Env Switcher] Successfully activated profile: ${profile}`);
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `[Env Switcher] Error copying environment file:`, err);
    process.exit(1);
  }
} else {
  console.error('\x1b[31m%s\x1b[0m', `[Env Switcher] Profile file not found: ${sourceFile}`);
  process.exit(1);
}
