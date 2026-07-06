-- Chapter 1 seed: 6 sequential missions using only the existing block set
-- (quantum_createCircuit, gates H/X/Y/Z/CX, quantum_measureAll, quantum_run).
-- grading_spec check types are interpreted by quantum-backend/grader.py (version 1):
--   num_qubits, blocks_used, blocks_forbidden, counts_distribution.

insert into public.chapters (title, order_index)
values ('양자 컴퓨팅 첫걸음', 1);

insert into public.missions (chapter_id, order_index, title, description, starter_project, grading_spec)
select c.id, m.order_index, m.title, m.description, null, m.grading_spec
from public.chapters c,
lateral (
    values
    (1,
     '큐비트 뒤집기',
     e'## 미션\n\n큐비트는 양자 컴퓨터의 기본 단위예요. 처음에는 항상 **|0⟩** 상태에서 시작해요.\n\n**X 게이트**는 큐비트를 뒤집는 스위치예요: |0⟩ → |1⟩\n\n### 할 일\n1. 큐비트 **1개**로 양자 회로를 만드세요\n2. **X 게이트**를 큐비트 0에 적용하세요\n3. 모든 큐비트를 측정하고 회로를 실행하세요\n\n측정 결과가 항상 **1**이 나오면 성공!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 1,
         "feedback_fail": "큐비트 1개로 회로를 만들어 보세요."},
        {"id": "x_used", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateX", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "X 게이트와 측정 블록이 필요해요."},
        {"id": "no_h", "type": "blocks_forbidden", "opcodes": ["quantum_gateH"],
         "feedback_fail": "이 미션에서는 H 게이트 없이 X 게이트만 사용해 보세요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"1": 1.0}, "tolerance": 0.02, "other_max": 0.02,
         "feedback_fail": "측정 결과가 항상 1이 되어야 해요. X 게이트를 큐비트 0에 적용했나요?"}
     ]}'::jsonb),
    (2,
     '중첩 만들기',
     e'## 미션\n\n**H 게이트(하다마드)**는 큐비트를 |0⟩과 |1⟩의 **중첩 상태**로 만들어요.\n\n중첩은 0도 1도 아닌, 양자만의 새로운 상태예요. **측정하는 순간** 0 또는 1 중 하나가 나오는데, 여러 번 반복하면 약 절반씩 나와요.\n\n### 할 일\n1. 큐비트 1개로 회로를 만드세요\n2. **H 게이트**를 큐비트 0에 적용하세요\n3. 측정하고 실행하세요 (shots를 충분히 크게!)\n\n측정 결과가 0과 1로 **약 50:50** 나오면 성공!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "h_used", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "H 게이트와 측정 블록이 필요해요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"0": 0.5, "1": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "0과 1이 약 50:50으로 나와야 해요. H 게이트를 사용했나요?"}
     ]}'::jsonb),
    (3,
     '두 번 뒤집기',
     e'## 미션\n\nX 게이트를 **두 번** 적용하면 어떻게 될까요?\n\n|0⟩ → |1⟩ → |0⟩ ... 다시 제자리로 돌아와요!\n\n### 할 일\n1. 큐비트 1개로 회로를 만드세요\n2. **X 게이트를 2번** 적용하세요\n3. 측정하고 실행하세요\n\n측정 결과가 항상 **0**이면 성공!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "x_twice", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateX", "min_count": 2},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "X 게이트를 2번 사용해야 해요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"0": 1.0}, "tolerance": 0.02, "other_max": 0.02,
         "feedback_fail": "측정 결과가 항상 0이 되어야 해요. X 게이트를 짝수 번 적용했나요?"}
     ]}'::jsonb),
    (4,
     '벨 상태 만들기',
     e'## 미션\n\n두 큐비트를 **얽힘(entanglement)** 상태로 만들어 봐요. 얽힌 두 큐비트는 각각 측정해도 결과가 **항상 짝을 이뤄요**.\n\n벨 상태에서는 측정 결과가 둘 다 0이거나 둘 다 1 — 따로 노는 법이 없어요.\n\n### 할 일\n1. 큐비트 **2개**로 회로를 만드세요\n2. **H 게이트**를 큐비트 0에 적용하세요\n3. **CX(CNOT) 게이트**를 제어 0, 대상 1로 적용하세요\n4. 측정하고 실행하세요\n\n결과가 **00과 11만** 반반씩 나오면 성공! (01, 10은 나오지 않아요)',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 2,
         "feedback_fail": "큐비트 2개로 회로를 만들어 보세요."},
        {"id": "gates", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_gateCX", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "H 게이트와 CX 게이트가 모두 필요해요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"00": 0.5, "11": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "00과 11만 반반씩 나와야 해요. H 다음에 CX를 적용했나요?"}
     ]}'::jsonb),
    (5,
     '반대로 얽힌 쌍',
     e'## 미션\n\n이번엔 측정 결과가 **항상 반대**가 되도록 두 큐비트를 얽어 봐요.\n\n벨 상태를 만든 다음, 한쪽 큐비트만 뒤집으면 돼요!\n\n### 할 일\n1. 큐비트 2개로 회로를 만드세요\n2. 벨 상태를 만드세요 (H + CX)\n3. **X 게이트**를 큐비트 1에 적용하세요\n4. 측정하고 실행하세요\n\n결과가 **01과 10만** 반반씩 나오면 성공!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 2,
         "feedback_fail": "큐비트 2개로 회로를 만들어 보세요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"01": 0.5, "10": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "01과 10만 반반씩 나와야 해요. 벨 상태를 만든 뒤 한쪽 큐비트만 뒤집어 보세요."}
     ]}'::jsonb),
    (6,
     'GHZ 삼총사',
     e'## 미션\n\n얽힘은 두 큐비트만의 것이 아니에요. **세 큐비트**를 한꺼번에 얽어 봐요! 이것을 **GHZ 상태**라고 불러요.\n\n### 할 일\n1. 큐비트 **3개**로 회로를 만드세요\n2. **H 게이트**를 큐비트 0에 적용하세요\n3. **CX 게이트**를 제어 0, 대상 1로 적용하세요\n4. **CX 게이트**를 제어 0, 대상 2로 적용하세요\n5. 측정하고 실행하세요\n\n결과가 **000과 111만** 반반씩 나오면 성공!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 3,
         "feedback_fail": "큐비트 3개로 회로를 만들어 보세요."},
        {"id": "gates", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_gateCX", "min_count": 2},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "H 게이트 1개와 CX 게이트 2개가 필요해요."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"000": 0.5, "111": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "000과 111만 반반씩 나와야 해요. 큐비트 0에서 1과 2로 각각 CX를 연결했나요?"}
     ]}'::jsonb)
) as m(order_index, title, description, grading_spec)
where c.order_index = 1;
