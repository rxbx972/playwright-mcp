from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / '.env'


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
