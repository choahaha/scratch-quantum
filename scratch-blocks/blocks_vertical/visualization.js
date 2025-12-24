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

goog.provide('Blockly.Blocks.visualization');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');


// ============================================
// visualization_histogram - 히스토그램 보기
// ============================================
Blockly.Blocks['visualization_histogram'] = {
  init: function() {
    this.jsonInit({
      "id": "visualization_histogram",
      "message0": Blockly.Msg.VISUALIZATION_HISTOGRAM,
      "args0": [
        {
          "type": "input_value",
          "name": "DATA"
        }
      ],
      "category": Blockly.Categories.visualization,
      "extensions": ["colours_visualization", "shape_statement"]
    });
  }
};

// ============================================
// visualization_circuitDiagram - 양자회로 그리기
// ============================================
Blockly.Blocks['visualization_circuitDiagram'] = {
  init: function() {
    this.jsonInit({
      "id": "visualization_circuitDiagram",
      "message0": Blockly.Msg.VISUALIZATION_CIRCUIT_DIAGRAM,
      "category": Blockly.Categories.visualization,
      "extensions": ["colours_visualization", "shape_statement"]
    });
  }
};
