# Scratch Quantum TODO

## 목표
스크래치 블록을 조립하면 Python qiskit 코드로 변환하여 실행하고, 결과를 말하기 블록으로 출력

---

## Phase 1: 백엔드 서버 (Railway 배포) ✅ 완료
- [x] `quantum-backend/` 디렉토리 생성
- [x] `main.py` - FastAPI 앱 구현
- [x] `executor.py` - Qiskit 실행기 구현
- [x] `requirements.txt` 작성
- [x] `Procfile` 작성
- [x] GitHub 저장소 생성 및 푸시
- [x] Railway 배포 완료
- [x] 도메인: `https://web-production-201eb.up.railway.app`

## Phase 2: 블록 정의 (scratch-blocks) ✅ 완료
- [x] `blocks_vertical/quantum.js` 생성
  - [x] quantum_createCircuit (양자 회로 만들기)
  - [x] quantum_gateH (H 게이트)
  - [x] quantum_gateX (X 게이트)
  - [x] quantum_gateY (Y 게이트)
  - [x] quantum_gateZ (Z 게이트)
  - [x] quantum_gateCX (CNOT 게이트)
  - [x] quantum_measure (측정하기)
  - [x] quantum_measureAll (모든 큐비트 측정)
  - [x] quantum_run (회로 실행하기)
  - [x] quantum_getResult (측정 결과)
- [x] `blocks_compressed_vertical.js`에 컴파일된 블록 추가

## Phase 3: 툴박스 XML (scratch-gui) ✅ 완료
- [x] `make-toolbox-xml.js` quantum 함수 수정
- [x] 블록 XML 추가

## Phase 4: VM 통합 (scratch-vm) ✅ 완료
- [x] `scratch3_quantum.js` 확장 클래스 생성
- [x] `runtime.js`에 quantum 등록
- [x] Railway API URL 설정
- [x] opcode/args 포맷 수정 (quantum_ prefix, 대문자)

## Phase 5: 테스트 ✅ 완료
- [x] scratch-gui 빌드
- [x] 블록 조립 테스트
- [x] API 호출 테스트
- [x] 결과 출력 확인: `|1>: 503 (50.3%), |0>: 497 (49.7%)`

## Phase 6: 히스토그램 시각화 🚧 진행중
- [ ] 백엔드: counts/total 데이터 반환 추가
- [ ] scratch-vm: _createHistogramCanvas, showHistogram 함수 구현
- [ ] scratch-blocks: quantum_showHistogram 블록 정의
- [ ] make-toolbox-xml: 블록 XML 추가
- [ ] blocks_compressed_vertical.js: 컴파일된 블록 추가
- [ ] 테스트

---

## 블록 목록

| 블록 | opcode | 유형 | 설명 |
|------|--------|------|------|
| 양자 회로 만들기 | quantum_createCircuit | COMMAND | 큐비트/클래식비트 수 지정 |
| H 게이트 | quantum_gateH | COMMAND | Hadamard |
| X 게이트 | quantum_gateX | COMMAND | Pauli-X |
| Y 게이트 | quantum_gateY | COMMAND | Pauli-Y |
| Z 게이트 | quantum_gateZ | COMMAND | Pauli-Z |
| CNOT 게이트 | quantum_gateCX | COMMAND | Controlled-NOT |
| 측정하기 | quantum_measure | COMMAND | 단일 큐비트 측정 |
| 모든 큐비트 측정 | quantum_measureAll | COMMAND | 전체 측정 |
| 회로 실행하기 | quantum_run | COMMAND | 시뮬레이터 실행 |
| 측정 결과 | quantum_getResult | REPORTER | 결과 문자열 반환 |
| 결과 그래프 보이기 | quantum_showHistogram | COMMAND | 히스토그램 시각화 |

---

## Phase 6 상세: 히스토그램 시각화 (Canvas 방식)

### 구현 방식
- HTML5 Canvas로 히스토그램 생성
- Canvas를 Scratch 코스튬으로 변환
- 현재 스프라이트의 코스튬으로 적용

### 수정 파일
1. **백엔드** (`executor.py`): counts/total 데이터 반환 추가
2. **scratch-vm** (`scratch3_quantum.js`): `_createHistogramCanvas`, `showHistogram` 함수 구현
3. **scratch-blocks** (`quantum.js`): `quantum_showHistogram` 블록 정의
4. **scratch-gui** (`make-toolbox-xml.js`): 블록 XML 추가
5. **scratch-blocks** (`blocks_compressed_vertical.js`): 컴파일된 블록 추가

### 사용 예시
```
[(초록 깃발)을 클릭했을 때]
[양자 회로 만들기 큐비트 1 클래식 비트 1]
[H 게이트 큐비트 0]
[측정하기 큐비트 0 클래식 비트 0]
[양자 회로 실행하기 샷 1000]
[결과 그래프 보이기]    ← 스프라이트가 막대그래프로 변환됨
```

---

## 목표 사용 예시

```
[양자 회로 만들기 큐비트 1 클래식 비트 1]
[H 게이트 큐비트 0]
[측정하기 큐비트 0 클래식 비트 0]
[양자 회로 실행하기 샷 1024]
[말하기 (양자 측정 결과)]
```

출력: `|0>: 512 (50.0%), |1>: 512 (50.0%)`
