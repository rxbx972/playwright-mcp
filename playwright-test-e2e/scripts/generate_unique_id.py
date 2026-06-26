import datetime
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from load_test_data import ENV_PATH, update_env_var


def generate_unique_id():
    """유니크한 테스트 사용자 ID를 생성합니다. (최대 20자, 영문 소문자와 숫자만)"""
    now = datetime.datetime.now()
    date_str = now.strftime("%Y%m%d")
    time_str = now.strftime("%H%M%S")

    unique_id = f"testuser{date_str}{time_str}"

    if len(unique_id) > 20:
        short_date = now.strftime("%y%m%d")
        unique_id = f"testuser{short_date}{time_str}"

        if len(unique_id) > 20:
            month_day = now.strftime("%m%d")
            hour_min_sec = now.strftime("%H%M%S")
            unique_id = f"testuser{month_day}{hour_min_sec}"

    return unique_id


def update_test_user_b_id():
    """`.env` 파일의 TEST_USER_B_ID를 유니크한 ID로 갱신합니다."""
    if not ENV_PATH.exists():
        print(f"Error: .env 파일을 찾을 수 없습니다: {ENV_PATH}")
        print("`.env` 파일을 생성하세요: cp .env.example .env")
        return None

    try:
        unique_id = generate_unique_id()
        update_env_var('TEST_USER_B_ID', unique_id)
        return unique_id
    except Exception as e:
        print(f"Error: .env 파일 처리 중 오류 발생: {e}")
        return None


def main():
    update_test_user_b_id()


if __name__ == "__main__":
    main()
