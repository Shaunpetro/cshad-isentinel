// scripts/build-with-env.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target || !['preview', 'production'].includes(target)) {
  console.error('Usage: node scripts/build-with-env.js <preview|production>');
  process.exit(1);
}

// 1. Parse .env file manually (or use dotenv if installed)
function loadEnvVars(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filePath} not found. No local env vars loaded.`);
    return env;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }
  return env;
}

// 2. Load .env from project root
const rootDir = path.resolve(__dirname, '..');
const dotenvPath = path.join(rootDir, '.env');
const localEnv = loadEnvVars(dotenvPath);

// 3. Set EAS project details based on target
const env = { ...process.env };

if (target === 'preview') {
  env.EAS_OWNER = 'shaunatg';  // Update if actual owner is shaunatg-2
  env.EAS_PROJECT_ID = 'ce9ad511-1168-4d71-941d-35a5f4214892';
  env.EAS_SLUG = 'cshadnews';
} else {
  env.EAS_OWNER = 'shaunpetro';
  env.EAS_PROJECT_ID = '41d9d284-b014-48ab-9238-fe2c0724fd98';
  env.EAS_SLUG = 'cshad-isentinel-news';
}

const profile = target === 'preview' ? 'preview' : 'production';

// 4. Collect all EXPO_PUBLIC_* variables from .env
const expoPublicVars = Object.keys(localEnv)
  .filter((key) => key.startsWith('EXPO_PUBLIC_'))
  .map((key) => `${key}=${localEnv[key]}`)
  .join(',');

// 5. Build command with optional --env
let command = `npx eas-cli build --platform android --profile ${profile} --non-interactive`;

if (expoPublicVars) {
  // Pass the variables as a single --env argument (comma-separated)
  command += ` --env "${expoPublicVars.replace(/"/g, '\\"')}"`;
  console.log(`ℹ️  Passing ${expoPublicVars.split(',').length} EXPO_PUBLIC_ variables to EAS build.`);
} else {
  console.warn('⚠️  No EXPO_PUBLIC_ variables found in .env. Build may fail if they are not set in EAS dashboard.');
}

console.log(`Building ${profile} with owner=${env.EAS_OWNER}, project=${env.EAS_PROJECT_ID}, slug=${env.EAS_SLUG}`);

// 6. Spawn the command
const child = spawn(command, {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('error', (err) => {
  console.error(`Failed to start command:`, err.message);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});