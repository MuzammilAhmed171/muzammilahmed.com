const { execSync } = require('child_process');

function run(cmd) {
  console.log('[run] ' + cmd);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  console.log('=== Pushing to GitHub (main branch) ===');
  run('git add -A');
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    const args = process.argv.slice(2).join(' ').trim();
    const msg = args || ('Update: ' + new Date().toISOString());
    run('git commit -m "' + msg + '"');
  } else {
    console.log('No new changes to commit.');
  }
  run('git push origin main');
  console.log('=== Successfully pushed to GitHub! ===');
} catch (err) {
  console.error('Push failed:', err.message);
  process.exit(1);
}
