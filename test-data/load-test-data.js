const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(PROJECT_ROOT, '.env');
const TEST_DATA_PATH = path.join(__dirname, 'test-data.json');

require('dotenv').config({ path: ENV_PATH });

const REQUIRED_ENV_VARS = [
  'BASE_URL',
  'TEST_USER_A_ID',
  'TEST_USER_A_PASSWORD',
  'TEST_USER_B_PASSWORD',
  'TEST_USER_B_NAME',
  'TEST_USER_B_INITIAL_PASSWORD',
];

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `필수 환경 변수가 없습니다: ${missing.join(', ')}\n` +
      '`.env` 파일을 생성하세요: cp .env.example .env'
    );
  }
}

function applyEnvConfig(testData) {
  return {
    ...testData,
    domain: process.env.BASE_URL || '',
    test_users: {
      A: {
        id: process.env.TEST_USER_A_ID || '',
        password: process.env.TEST_USER_A_PASSWORD || '',
      },
      B: {
        id: process.env.TEST_USER_B_ID || '',
        password: process.env.TEST_USER_B_PASSWORD || '',
        name: process.env.TEST_USER_B_NAME || '',
        initial_password: process.env.TEST_USER_B_INITIAL_PASSWORD || '',
      },
    },
  };
}

function loadTestData({ validate = true } = {}) {
  if (validate) {
    validateEnv();
  }

  if (!fs.existsSync(TEST_DATA_PATH)) {
    throw new Error('test-data/test-data.json 파일이 필요합니다.');
  }

  const testData = JSON.parse(fs.readFileSync(TEST_DATA_PATH, 'utf8'));
  return applyEnvConfig(testData);
}

function updateEnvVar(key, value) {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error('`.env` 파일이 필요합니다: cp .env.example .env');
  }

  const lines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
  let found = false;
  const updatedLines = lines.map((line) => {
    if (line.trim().startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });

  if (!found) {
    updatedLines.push(`${key}=${value}`);
  }

  fs.writeFileSync(ENV_PATH, `${updatedLines.join('\n').replace(/\n?$/, '\n')}`);
}

module.exports = {
  loadTestData,
  applyEnvConfig,
  updateEnvVar,
  ENV_PATH,
  TEST_DATA_PATH,
};
