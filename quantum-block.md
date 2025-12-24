# Quantum Blocks Reference

Scratch Quantum 프로젝트에서 사용되는 양자 컴퓨팅 블록들의 명세와 Python(Qiskit) 코드 대응 방법입니다.

## 블록 목록

| 블록명 | Opcode | 블록 타입 |
|--------|--------|----------|
| create quantum circuit | `quantum_createCircuit` | Statement |
| H gate | `quantum_gateH` | Statement |
| X gate | `quantum_gateX` | Statement |
| Y gate | `quantum_gateY` | Statement |
| Z gate | `quantum_gateZ` | Statement |
| CNOT gate | `quantum_gateCX` | Statement |
| measure | `quantum_measure` | Statement |
| measure all | `quantum_measureAll` | Statement |
| run quantum circuit | `quantum_run` | Statement |
| quantum measurement result | `quantum_getResult` | Reporter |

---

## 블록 상세 설명 및 Python 대응

### 1. create quantum circuit (양자 회로 생성)

**Scratch 블록:**
```
create quantum circuit qubits [NUM_QUBITS] classical bits [NUM_CLBITS]
```

**기능:**
- 지정된 수의 큐비트와 클래식 비트를 가진 양자 회로를 생성합니다.
- 기본값: 큐비트 1개, 클래식 비트 1개
- 제한: 최대 10개 큐비트, 100개 게이트

**Python (Qiskit) 대응:**
```python
from qiskit import QuantumCircuit

# 큐비트 2개, 클래식 비트 2개인 회로 생성
qc = QuantumCircuit(2, 2)
```

---

### 2. H gate (하다마드 게이트)

**Scratch 블록:**
```
H gate qubit [QUBIT]
```

**기능:**
- 지정된 큐비트에 하다마드 게이트를 적용합니다.
- |0⟩ 상태를 중첩 상태 (|0⟩ + |1⟩)/√2 로 변환합니다.
- |1⟩ 상태를 (|0⟩ - |1⟩)/√2 로 변환합니다.
- 양자 중첩을 만드는 가장 기본적인 게이트입니다.

**행렬 표현:**
```
H = 1/√2 * | 1   1 |
           | 1  -1 |
```

**Python (Qiskit) 대응:**
```python
qc.h(0)  # 큐비트 0에 H 게이트 적용
```

---

### 3. X gate (파울리-X 게이트 / NOT 게이트)

**Scratch 블록:**
```
X gate qubit [QUBIT]
```

**기능:**
- 지정된 큐비트에 파울리-X 게이트를 적용합니다.
- 양자 NOT 게이트로, |0⟩ ↔ |1⟩ 상태를 뒤집습니다.
- 비트 플립(bit flip) 연산입니다.

**행렬 표현:**
```
X = | 0  1 |
    | 1  0 |
```

**Python (Qiskit) 대응:**
```python
qc.x(0)  # 큐비트 0에 X 게이트 적용
```

---

### 4. Y gate (파울리-Y 게이트)

**Scratch 블록:**
```
Y gate qubit [QUBIT]
```

**기능:**
- 지정된 큐비트에 파울리-Y 게이트를 적용합니다.
- 비트 플립과 위상 플립을 동시에 수행합니다.
- |0⟩ → i|1⟩, |1⟩ → -i|0⟩

**행렬 표현:**
```
Y = | 0  -i |
    | i   0 |
```

**Python (Qiskit) 대응:**
```python
qc.y(0)  # 큐비트 0에 Y 게이트 적용
```

---

### 5. Z gate (파울리-Z 게이트)

**Scratch 블록:**
```
Z gate qubit [QUBIT]
```

**기능:**
- 지정된 큐비트에 파울리-Z 게이트를 적용합니다.
- 위상 플립(phase flip) 연산입니다.
- |0⟩ 상태는 그대로, |1⟩ 상태에 -1을 곱합니다.

**행렬 표현:**
```
Z = | 1   0 |
    | 0  -1 |
```

**Python (Qiskit) 대응:**
```python
qc.z(0)  # 큐비트 0에 Z 게이트 적용
```

---

### 6. CNOT gate (제어-NOT 게이트)

**Scratch 블록:**
```
CNOT gate control [CONTROL] target [TARGET]
```

**기능:**
- 2큐비트 게이트로, 제어 큐비트가 |1⟩일 때만 타겟 큐비트를 플립합니다.
- 양자 얽힘(entanglement)을 생성하는 핵심 게이트입니다.
- 기본값: control=0, target=1

**진리표:**
```
|00⟩ → |00⟩
|01⟩ → |01⟩
|10⟩ → |11⟩
|11⟩ → |10⟩
```

**Python (Qiskit) 대응:**
```python
qc.cx(0, 1)  # 큐비트 0이 제어, 큐비트 1이 타겟
```

---

### 7. measure (단일 큐비트 측정)

**Scratch 블록:**
```
measure qubit [QUBIT] to classical bit [CLBIT]
```

**기능:**
- 지정된 큐비트를 측정하여 클래식 비트에 결과를 저장합니다.
- 측정 결과는 0 또는 1입니다.
- 측정 후 큐비트의 중첩 상태는 붕괴됩니다.

**Python (Qiskit) 대응:**
```python
qc.measure(0, 0)  # 큐비트 0을 측정하여 클래식 비트 0에 저장
```

---

### 8. measure all (전체 측정)

**Scratch 블록:**
```
measure all qubits
```

**기능:**
- 회로의 모든 큐비트를 측정합니다.
- 각 큐비트의 측정 결과가 대응하는 클래식 비트에 저장됩니다.

**Python (Qiskit) 대응:**
```python
qc.measure_all()  # 모든 큐비트 측정
# 또는
qc.measure(range(num_qubits), range(num_clbits))
```

---

### 9. run quantum circuit (양자 회로 실행)

**Scratch 블록:**
```
run quantum circuit shots [SHOTS]
```

**기능:**
- 구성된 양자 회로를 지정된 횟수(shots)만큼 실행합니다.
- 기본값: 1024 shots
- 제한: 최대 10,000 shots
- 백엔드: Qiskit Aer 시뮬레이터 사용

**Python (Qiskit) 대응:**
```python
from qiskit_aer import AerSimulator

simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
result = job.result()
counts = result.get_counts()
```

---

### 10. quantum measurement result (측정 결과)

**Scratch 블록:**
```
quantum measurement result
```

**기능:**
- 마지막 양자 회로 실행의 측정 결과를 반환합니다.
- Reporter 블록으로, 다른 블록의 입력으로 사용 가능합니다.
- 결과 형식: 상위 5개 측정 상태와 확률(%) 표시

**결과 예시:**
```
|00⟩: 50.2%
|11⟩: 49.8%
```

**Python (Qiskit) 대응:**
```python
counts = result.get_counts()
total = sum(counts.values())
for state, count in sorted(counts.items(), key=lambda x: -x[1])[:5]:
    percentage = (count / total) * 100
    print(f"|{state}⟩: {percentage:.1f}%")
```

---

## 전체 예제: Bell State 생성

### Scratch 블록 순서:
1. `create quantum circuit qubits 2 classical bits 2`
2. `H gate qubit 0`
3. `CNOT gate control 0 target 1`
4. `measure all qubits`
5. `run quantum circuit shots 1024`
6. `quantum measurement result` (결과 확인)

### 동등한 Python 코드:
```python
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 1. 회로 생성
qc = QuantumCircuit(2, 2)

# 2. H 게이트 적용
qc.h(0)

# 3. CNOT 게이트 적용
qc.cx(0, 1)

# 4. 측정
qc.measure_all()

# 5. 실행
simulator = AerSimulator()
job = simulator.run(qc, shots=1024)
result = job.result()

# 6. 결과 출력
counts = result.get_counts()
print(counts)  # {'00': ~512, '11': ~512}
```

**예상 결과:**
```
|00⟩: ~50%
|11⟩: ~50%
```
Bell 상태에서는 두 큐비트가 얽혀서 항상 같은 값(00 또는 11)으로 측정됩니다.

---

## 파일 위치

| 구성요소 | 파일 경로 |
|---------|----------|
| 블록 UI 정의 | `scratch-blocks/blocks_vertical/quantum.js` |
| 런타임 구현 | `scratch-gui/node_modules/scratch-vm/src/blocks/scratch3_quantum.js` |
| 툴박스 정의 | `scratch-gui/src/lib/make-toolbox-xml.js` (lines 740-827) |
| 메시지 문자열 | `scratch-blocks/msg/messages.js` (lines 295-305) |
| 블록 색상 | `scratch-blocks/core/colours.js` (lines 96-101) |
| 백엔드 실행기 | `quantum-backend/executor.py` |

---

## 제한사항

- 최대 큐비트 수: 10개
- 최대 게이트 수: 100개
- 최대 shots: 10,000회
- API 타임아웃: 30초
