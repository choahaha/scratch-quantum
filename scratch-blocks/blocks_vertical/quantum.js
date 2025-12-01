/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2024 Scratch Quantum Project
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.quantum');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


// ============================================
// 1. quantum_createCircuit - 양자 회로 만들기
// ============================================
Blockly.Blocks['quantum_createCircuit'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_createCircuit",
      "message0": "양자 회로 만들기 큐비트 %1 클래식 비트 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "NUM_QUBITS"
        },
        {
          "type": "input_value",
          "name": "NUM_CLBITS"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 2. quantum_gateH - H 게이트 (Hadamard)
// ============================================
Blockly.Blocks['quantum_gateH'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_gateH",
      "message0": "H 게이트 큐비트 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "QUBIT"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 3. quantum_gateX - X 게이트 (Pauli-X, NOT)
// ============================================
Blockly.Blocks['quantum_gateX'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_gateX",
      "message0": "X 게이트 큐비트 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "QUBIT"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 4. quantum_gateY - Y 게이트 (Pauli-Y)
// ============================================
Blockly.Blocks['quantum_gateY'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_gateY",
      "message0": "Y 게이트 큐비트 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "QUBIT"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 5. quantum_gateZ - Z 게이트 (Pauli-Z)
// ============================================
Blockly.Blocks['quantum_gateZ'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_gateZ",
      "message0": "Z 게이트 큐비트 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "QUBIT"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 6. quantum_gateCX - CNOT 게이트 (Controlled-NOT)
// ============================================
Blockly.Blocks['quantum_gateCX'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_gateCX",
      "message0": "CNOT 게이트 제어 %1 대상 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "CONTROL"
        },
        {
          "type": "input_value",
          "name": "TARGET"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 7. quantum_measure - 측정하기
// ============================================
Blockly.Blocks['quantum_measure'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_measure",
      "message0": "측정하기 큐비트 %1 클래식 비트 %2",
      "args0": [
        {
          "type": "input_value",
          "name": "QUBIT"
        },
        {
          "type": "input_value",
          "name": "CLBIT"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 8. quantum_measureAll - 모든 큐비트 측정하기
// ============================================
Blockly.Blocks['quantum_measureAll'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_measureAll",
      "message0": "모든 큐비트 측정하기",
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 9. quantum_run - 양자 회로 실행하기
// ============================================
Blockly.Blocks['quantum_run'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_run",
      "message0": "양자 회로 실행하기 샷 %1",
      "args0": [
        {
          "type": "input_value",
          "name": "SHOTS"
        }
      ],
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "shape_statement"]
    });
  }
};

// ============================================
// 10. quantum_getResult - 측정 결과 (Reporter)
// ============================================
Blockly.Blocks['quantum_getResult'] = {
  init: function() {
    this.jsonInit({
      "id": "quantum_getResult",
      "message0": "양자 측정 결과",
      "category": Blockly.Categories.quantum,
      "extensions": ["colours_quantum", "output_string"]
    });
  }
};
