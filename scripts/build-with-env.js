const { spawn } = require('child_process');

const target = process.argv[2];
if (!target || !['preview', 'production'].includes(target)) {
  console.error('Usage: node scripts/build-with-env.js <preview|production>');
  process.exit(1);
}

const env = { ...process.env };

if (target === 'preview') {
  env.EAS_OWNER = 'shaunatg-2';
  env.EAS_PROJECT_ID = 'ce9ad511-1168-4d71-941d-35a5f4214892';
  env.EAS_SLUG = 'cshadnews';
} else {
  env.EAS_OWNER = 'shaunpetro';
  env.EAS_PROJECT_ID = '41d9d284-b014-48ab-9238-fe2c0724fd98';
  env.EAS_SLUG = 'cshad-isentinel-news';
}

const profile = target === 'preview' ? 'preview' : 'production';
console.log(Building C:\Users\Petro Malamule\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1 with owner=, project=, slug=);

const child = spawn(
  'npx',
  ['eas-cli', 'build', '--platform', 'android', '--profile', profile, '--non-interactive'],
  { stdio: 'inherit', env }
);

child.on('close', (code) => {
  process.exit(code || 0);
});
