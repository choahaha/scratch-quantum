-- Chapter 1 seed: 6 sequential missions using only the existing block set
-- (quantum_createCircuit, gates H/X/Y/Z/CX, quantum_measureAll, quantum_run).
-- grading_spec check types are interpreted by quantum-backend/grader.py (version 1):
--   num_qubits, blocks_used, blocks_forbidden, counts_distribution.
-- NOTE: content is kept in sync with the live DB (English since 2026-07-06;
-- the original Korean seed is in git history).

insert into public.chapters (title, order_index)
values ('First Steps in Quantum Computing', 1);

insert into public.missions (chapter_id, order_index, title, description, starter_project, grading_spec)
select c.id, m.order_index, m.title, m.description, null, m.grading_spec
from public.chapters c,
lateral (
    values
    (1,
     'Flip the Qubit',
     e'## Mission\n\nA qubit is the basic unit of a quantum computer. It always starts in the **|0⟩** state.\n\nThe **X gate** is a switch that flips a qubit: |0⟩ → |1⟩\n\n### Your task\n1. Create a quantum circuit with **1 qubit**\n2. Apply an **X gate** to qubit 0\n3. Measure all qubits and run the circuit\n\nYou succeed if the measurement is always **1**!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 1,
         "feedback_fail": "Build your circuit with exactly 1 qubit."},
        {"id": "x_used", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateX", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "You need an X gate and a measure block."},
        {"id": "no_h", "type": "blocks_forbidden", "opcodes": ["quantum_gateH"],
         "feedback_fail": "Try this mission with only the X gate — no H gate."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"1": 1.0}, "tolerance": 0.02, "other_max": 0.02,
         "feedback_fail": "The measurement should always be 1. Did you apply the X gate to qubit 0?"}
     ]}'::jsonb),
    (2,
     'Create Superposition',
     e'## Mission\n\nThe **H gate (Hadamard)** puts a qubit into a **superposition** of |0⟩ and |1⟩.\n\nSuperposition is a genuinely quantum state — neither 0 nor 1. **The moment you measure**, you get either 0 or 1, and over many repetitions each appears about half the time.\n\n### Your task\n1. Create a circuit with 1 qubit\n2. Apply an **H gate** to qubit 0\n3. Measure and run (use plenty of shots!)\n\nYou succeed if 0 and 1 each appear **about 50:50**!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "h_used", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "You need an H gate and a measure block."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"0": 0.5, "1": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "0 and 1 should appear about 50:50. Did you use the H gate?"}
     ]}'::jsonb),
    (3,
     'Flip It Twice',
     e'## Mission\n\nWhat happens if you apply the X gate **twice**?\n\n|0⟩ → |1⟩ → |0⟩ ... right back where you started!\n\n### Your task\n1. Create a circuit with 1 qubit\n2. Apply the **X gate twice**\n3. Measure and run\n\nYou succeed if the measurement is always **0**!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "x_twice", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateX", "min_count": 2},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "Use the X gate twice."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"0": 1.0}, "tolerance": 0.02, "other_max": 0.02,
         "feedback_fail": "The measurement should always be 0. Did you apply the X gate an even number of times?"}
     ]}'::jsonb),
    (4,
     'Build a Bell State',
     e'## Mission\n\nLet''s **entangle** two qubits. When qubits are entangled, their measurement results are **always paired**, even though you measure each one separately.\n\nIn a Bell state the results are either both 0 or both 1 — they never disagree.\n\n### Your task\n1. Create a circuit with **2 qubits**\n2. Apply an **H gate** to qubit 0\n3. Apply a **CX (CNOT) gate** with control 0 and target 1\n4. Measure and run\n\nYou succeed if you only see **00 and 11**, about half each! (01 and 10 never appear)',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 2,
         "feedback_fail": "Build your circuit with exactly 2 qubits."},
        {"id": "gates", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_gateCX", "min_count": 1},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "You need both an H gate and a CX gate."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"00": 0.5, "11": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "Only 00 and 11 should appear, about half each. Did you apply H and then CX?"}
     ]}'::jsonb),
    (5,
     'Opposite Entangled Pair',
     e'## Mission\n\nThis time, entangle two qubits so their measurement results are **always opposite**.\n\nBuild a Bell state first, then flip just one of the qubits!\n\n### Your task\n1. Create a circuit with 2 qubits\n2. Build a Bell state (H + CX)\n3. Apply an **X gate** to qubit 1\n4. Measure and run\n\nYou succeed if you only see **01 and 10**, about half each!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 2,
         "feedback_fail": "Build your circuit with exactly 2 qubits."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"01": 0.5, "10": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "Only 01 and 10 should appear, about half each. Build a Bell state, then flip just one qubit."}
     ]}'::jsonb),
    (6,
     'The GHZ Trio',
     e'## Mission\n\nEntanglement isn''t just for two qubits. Let''s entangle **three qubits** at once — this is called a **GHZ state**.\n\n### Your task\n1. Create a circuit with **3 qubits**\n2. Apply an **H gate** to qubit 0\n3. Apply a **CX gate** with control 0 and target 1\n4. Apply a **CX gate** with control 0 and target 2\n5. Measure and run\n\nYou succeed if you only see **000 and 111**, about half each!',
     '{"version": 1, "pass_policy": "all", "checks": [
        {"id": "qubits", "type": "num_qubits", "equals": 3,
         "feedback_fail": "Build your circuit with exactly 3 qubits."},
        {"id": "gates", "type": "blocks_used",
         "opcodes": [{"opcode": "quantum_gateH", "min_count": 1},
                     {"opcode": "quantum_gateCX", "min_count": 2},
                     {"opcode": "quantum_measureAll", "min_count": 1}],
         "feedback_fail": "You need 1 H gate and 2 CX gates."},
        {"id": "dist", "type": "counts_distribution", "shots": 2048,
         "expected": {"000": 0.5, "111": 0.5}, "tolerance": 0.1, "other_max": 0.02,
         "feedback_fail": "Only 000 and 111 should appear, about half each. Did you connect CX from qubit 0 to qubits 1 and 2?"}
     ]}'::jsonb)
) as m(order_index, title, description, grading_spec)
where c.order_index = 1;
