const { spawn } = require('child_process');

const target = process.argv[2];
if (!target || !['preview', 'preview-prod', 'production'].includes(target)) {
  console.error('Usage: node scripts/build-with-env.js <preview|preview-prod|production>');
  process.exit(1);
}

const env = { ...process.env };

if (target === 'preview') {
  env.EAS_OWNER = 'shaunatg-2';
  env.EAS_PROJECT_ID = 'ce9ad511-1168-4d71-941d-35a5f4214892';
  env.EAS_SLUG = 'cshadnews';
} else if (target === 'preview-prod') {
  env.EAS_OWNER = 'shaunpetro';
  env.EAS_PROJECT_ID = '41d9d284-b014-48ab-9238-fe2c0724fd98';
  env.EAS_SLUG = 'cshad-isentinel-news';
} else {
  env.EAS_OWNER = 'shaunpetro';
  env.EAS_PROJECT_ID = '41d9d284-b014-48ab-9238-fe2c0724fd98';
  env.EAS_SLUG = 'cshad-isentinel-news';
}

const profile = target === 'production' ? 'production' : 'preview';
console.log(`Building ${profile} with owner=${env.EAS_OWNER}, project=${env.EAS_PROJECT_ID}, slug=${env.EAS_SLUG}`);

const command = `npx --yes eas-cli@latest build --platform android --profile ${profile} --non-interactive`;
const child = spawn(command, { stdio: 'inherit', env, shell: true });

child.on('error', (err) => {
  console.error(`Failed to start command:`, err.message);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});