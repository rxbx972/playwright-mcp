import json
import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / '.env'
TEST_DATA_PATH = PROJECT_ROOT / 'test-data' / 'test-data.json'

REQUIRED_ENV_VARS = [
    'BASE_URL',
    'TEST_USER_A_ID',
    'TEST_USER_A_PASSWORD',
    'TEST_USER_B_PASSWORD',
    'TEST_USER_B_NAME',
    'TEST_USER_B_INITIAL_PASSWORD',
]


def validate_env():
    missing = [name for name in REQUIRED_ENV_VARS if not os.environ.get(name)]

    if missing:
        raise ValueError(
            f"필수 환경 변수가 없습니다: {', '.join(missing)}\n"
            "`.env` 파일을 생성하세요: cp .env.example .env"
        )


def apply_env_config(test_data):
    return {
        **test_data,
        'domain': os.environ.get('BASE_URL', ''),
        'test_users': {
            'A': {
                'id': os.environ.get('TEST_USER_A_ID', ''),
                'password': os.environ.get('TEST_USER_A_PASSWORD', ''),
            },
            'B': {
                'id': os.environ.get('TEST_USER_B_ID', ''),
                'password': os.environ.get('TEST_USER_B_PASSWORD', ''),
                'name': os.environ.get('TEST_USER_B_NAME', ''),
                'initial_password': os.environ.get('TEST_USER_B_INITIAL_PASSWORD', ''),
            },
        },
    }


def update_env_var(key, value, env_path=None):
    env_path = Path(env_path) if env_path else ENV_PATH

    if not env_path.exists():
        raise FileNotFoundError('`.env` 파일이 필요합니다: cp .env.example .env')

    lines = env_path.read_text(encoding='utf-8').splitlines()
    found = False
    updated_lines = []

    for line in lines:
        if line.strip().startswith(f'{key}='):
            updated_lines.append(f'{key}={value}')
            found = True
        else:
            updated_lines.append(line)

    if not found:
        updated_lines.append(f'{key}={value}')

    env_path.write_text('\n'.join(updated_lines) + '\n', encoding='utf-8')


def load_test_data(validate=True):
    load_dotenv(ENV_PATH)

    if validate:
        validate_env()

    if not TEST_DATA_PATH.exists():
        raise FileNotFoundError('test-data/test-data.json 파일이 필요합니다.')

    with open(TEST_DATA_PATH, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    return apply_env_config(test_data)
