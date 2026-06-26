# 유니크 ID 생성 오류

## **문제 개요**

### **문제 현상**

- Playwright가 5개 워커로 병렬 실행 시 유니크 ID 생성 스크립트에서 JSON 파싱 오류 발생
- 오류 메시지: json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
- 일부 테스트에서 유니크 ID 생성 실패로 기존 ID 사용

## **원인 분석**

### **1. 경쟁 상태 (Race Condition)**

```markdown
워커 1: test-data.json 읽기 시작
워커 2: test-data.json 읽기 시작  
워커 3: test-data.json 쓰기 시작 → 파일 손상
워커 4: test-data.json 읽기 시도 → JSON 파싱 오류
워커 5: test-data.json 읽기 시도 → JSON 파싱 오류
```

### **2. 파일 I/O 충돌**

- **동시 접근**: 5개 워커가 동시에 test-data.json 파일에 접근
- **파일 잠금 부재**: 파일 수정 중 다른 프로세스의 접근을 차단하는 메커니즘 없음
- **부분 쓰기**: 한 프로세스가 파일을 쓰는 중 다른 프로세스가 읽기 시도

### **3. Playwright 병렬 실행 구조**

```markdown
// 문제가 된 코드
test.beforeAll(async () => {
    generateUniqueId(); // 모든 워커에서 동시 실행
});
```

## **해결 방안**

### **선택된 해결책: 단일 프로세스 실행**

### **수정 전 코드**

```markdown
test.beforeAll(async () => {
    // 매번 테스트 시작 시 유니크 ID 생성
    const idGenerated = generateUniqueId();
    if (!idGenerated) {
        console.warn('유니크 ID 생성에 실패했습니다. 기존 ID를 사용합니다.');
    }
    
    testData = loadTestData();
    scenarios = loadScenarios();
});
```

### **수정 후 코드**

```markdown
test.beforeAll(async () => {
    // 단일 프로세스에서만 유니크 ID 생성 (경쟁 상태 방지)
    if (process.env.WORKER_INDEX === '0' || !process.env.WORKER_INDEX) {
        console.log('첫 번째 워커에서 유니크 ID를 생성합니다...');
        const idGenerated = generateUniqueId();
        if (!idGenerated) {
            console.warn('유니크 ID 생성에 실패했습니다. 기존 ID를 사용합니다.');
        }
    } else {
        console.log(`워커 ${process.env.WORKER_INDEX}에서 유니크 ID 생성을 건너뜁니다.`);
    }
    
    testData = loadTestData();
    scenarios = loadScenarios();
});
```

## **해결 효과**

### **이전 상태 (오류 발생)**

```markdown
유니크 ID 생성 실패: Command failed: python3 "/Users/jiyeon/nl-scenario-pipeline/playwright-test-e2e/scripts/generate_unique_id.py"
Traceback (most recent call last):
  File "/Users/jiyeon/nl-scenario-pipeline/playwright-test-e2e/scripts/generate_unique_id.py", line 60, in <module>
    main() 
  File "/Users/jiyeon/nl-scenario-pipeline/playwright-test-e2e/scripts/generate_unique_id.py", line 56, in main
    unique_id = update_test_data()
  File "/Users/jiyeon/nl-scenario-pipeline/playwright-test-e2e/scripts/generate_unique_id.py", line 35, in update_test_data
    test_data = json.load(f)
json.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

### **현재 상태 (성공)**

```markdown
첫 번째 워커에서 유니크 ID를 생성합니다...
유니크한 ID가 생성되었습니다: testuser250729103926
ID 길이: 20자
test-data.json 파일이 업데이트되었습니다.
```

- 이전 상태 (오류 발생)

![image.png](%EC%9C%A0%EB%8B%88%ED%81%AC%20ID%20%EC%83%9D%EC%84%B1%20%EC%98%A4%EB%A5%98/image.png)

- 현재 상태 (성공)

![image.png](%EC%9C%A0%EB%8B%88%ED%81%AC%20ID%20%EC%83%9D%EC%84%B1%20%EC%98%A4%EB%A5%98/image%201.png)

## **테스트 결과**

### **성공 지표**

- ✅ **모든 5개 테스트 통과**: 100% 성공률
- ✅ **경쟁 상태 완전 해결**: 파일 충돌 없음
- ✅ **성능 유지**: 실행 시간 9.4초 (이전과 동일)
- ✅ **안정성 향상**: JSON 파일 손상 위험 제거

## **결론**

- 단일 프로세스에서만 유니크 ID를 생성하는 방식으로 수정하여 경쟁 상태 문제를 완전히 해결함
- 이 해결책은 **안정성, 성능, 유지보수성**을 모두 고려한 최적의 선택
- 향후 유사한 문제 발생을 방지할 수 있는 견고한 기반을 마련