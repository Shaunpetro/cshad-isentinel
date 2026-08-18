// scripts/build-with-env.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const target = process.argv[2];
if (!target || !['preview', 'production'].includes(target)) {
  console.error('Usage: node scripts/build-with-env.js <preview|production>');
  process.exit(1);
}

// Resolve project root
const rootDir = path.resolve(__dirname, '..');
const dotenvPath = path.join(rootDir, '.env');

// Simple .env parser
function parseEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${filePath} not found.`);
    return env;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[match[1].trim()] = value;
    }
  }
  return env;
}

// Load local .env
const localEnv = parseEnvFile(dotenvPath);

// Set EAS project details
const env = { ...process.env };
if (target === 'preview') {
  env.EAS_OWNER = 'shaunatg'; // 🔁 change to 'shaunatg-2' if that is the actual preview owner
  env.EAS_PROJECT_ID = 'ce9ad511-1168-4d71-941d-35a5f4214892';
  env.EAS_SLUG = 'cshadnews';
} else {
  env.EAS_OWNER = 'shaunpetro';
  env.EAS_PROJECT_ID = '41d9d284-b014-48ab-9238-fe2c0724fd98';
  env.EAS_SLUG = 'cshad-isentinel-news';
}

const profile = target === 'preview' ? 'preview' : 'production';

// Prepare temporary env file for EXPO_PUBLIC_* variables
const expoPublicKeys = Object.keys(localEnv).filter((key) => key.startsWith('EXPO_PUBLIC_'));
let tempEnvFilePath = null;
let command = `npx --yes eas-cli@latest build --platform android --profile ${profile} --non-interactive`;

if (expoPublicKeys.length > 0) {
  const tempFileName = `.eas-build-${Date.now()}.env`;
  tempEnvFilePath = path.join(os.tmpdir(), tempFileName);
  const envFileContent = expoPublicKeys.map((key) => `${key}=${localEnv[key]}`).join('\n');
  fs.writeFileSync(tempEnvFilePath, envFileContent);
  command += ` --env-file "${tempEnvFilePath}"`;
  console.log(`✅ Created temporary env file with ${expoPublicKeys.length} EXPO_PUBLIC_ variables.`);
} else {
  console.warn('⚠️  No EXPO_PUBLIC_ variables found in .env. Relying on EAS dashboard variables.');
}

console.log(`Building ${profile} with owner=${env.EAS_OWNER}, project=${env.EAS_PROJECT_ID}, slug=${env.EAS_SLUG}`);

function cleanupTempFile() {
  if (tempEnvFilePath && fs.existsSync(tempEnvFilePath)) {
    fs.unlinkSync(tempEnvFilePath);
    console.log('🧹 Removed temporary env file.');
  }
}

const child = spawn(command, {
  stdio: 'inherit',
  env,
  shell: true,
});

child.on('error', (err) => {
  console.error(`Failed to start command:`, err.message);
  cleanupTempFile();
  process.exit(1);
});

child.on('close', (code) => {
  cleanupTempFile();
  process.exit(code || 0);
});