const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log('Running:', cmd);
  execSync(cmd, { stdio: 'inherit' });
}

// 1. Build frontend
run('npm --prefix frontend run build');

// 2. Read dist files into temp folder inside project
const distDir = path.resolve('frontend/dist');
const backupDir = path.resolve('.temp_dist_backup');
if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
fs.cpSync(distDir, backupDir, { recursive: true });

// 3. Checkout gh-pages branch
run('git checkout -B gh-pages origin/gh-pages');

// 4. Copy dist files over to root
fs.cpSync(backupDir, '.', { recursive: true });
fs.rmSync(backupDir, { recursive: true, force: true });

// 5. Add, commit, and push
run('git add -A');
try {
  run('git commit -m "Deploy latest build to gh-pages"');
} catch (e) {
  console.log('Nothing new to commit or already up to date');
}
run('git push origin gh-pages');

// 6. Switch back to main
run('git checkout main');
console.log('Successfully deployed to gh-pages and returned to main!');
