# 시각화(Visualization) 블록 카테고리 추가 계획

## 개요
- **목표**: 양자 컴퓨팅 결과를 matplotlib 히스토그램으로 시각화하는 새 블록 카테고리 추가
- **카테고리명**: 시각화 (Visualization)
- **색상**: 회색 (Gray)
- **블록**: 히스토그램 1개

---

## 수정할 파일 목록 (9개)

### 1. scratch-blocks/core/constants.js (line 273)
**작업**: 카테고리 ID 추가
```javascript
  "quantum": "quantum",
  "visualization": "visualization"  // 추가
```

### 2. scratch-blocks/core/colours.js (line 101 뒤)
**작업**: 회색 색상 팔레트 추가
```javascript
  "visualization": {
    "primary": "#8C8C8C",
    "secondary": "#7A7A7A",
    "tertiary": "#666666",
    "quaternary": "#666666"
  },
```

### 3. scratch-blocks/msg/messages.js (양자 블록 메시지 뒤)
**작업**: 카테고리명 및 블록 메시지 추가
```javascript
// Visualization blocks
Blockly.Msg.CATEGORY_VISUALIZATION = 'Visualization';
Blockly.Msg.VISUALIZATION_HISTOGRAM = 'show histogram of %1';
```

### 4. scratch-blocks/blocks_vertical/visualization.js (새 파일)
**작업**: 블록 UI 정의 파일 생성
```javascript
'use strict';
goog.provide('Blockly.Blocks.visualization');
goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.ScratchBlocks.VerticalExtensions');

Blockly.Blocks['visualization_histogram'] = {
  init: function() {
    this.jsonInit({
      "id": "visualization_histogram",
      "message0": Blockly.Msg.VISUALIZATION_HISTOGRAM,
      "args0": [{ "type": "input_value", "name": "DATA" }],
      "category": Blockly.Categories.visualization,
      "extensions": ["colours_visualization", "shape_statement"]
    });
  }
};
```

### 5. scratch-blocks/blocks_vertical/vertical_extensions.js (line 227)
**작업**: categoryNames 배열에 'visualization' 추가
```javascript
  var categoryNames =
      ['control', 'data', 'data_lists', 'sounds', 'motion', 'looks', 'event',
        'sensing', 'pen', 'operators', 'more', 'quantum', 'visualization'];
```

### 6. scratch-gui/src/lib/themes/default/index.js (line 75 뒤)
**작업**: 테마 색상 추가
```javascript
    visualization: {
        primary: '#8C8C8C',
        secondary: '#7A7A7A',
        tertiary: '#666666',
        quaternary: '#666666'
    },
```

### 7. scratch-gui/src/lib/make-toolbox-xml.js
**작업 A**: visualization 함수 추가 (line 827 뒤)
```javascript
const visualization = function (isInitialSetup, isStage, targetId, colors) {
    return `
    <category
        name="%{BKY_CATEGORY_VISUALIZATION}"
        id="visualization"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        <block type="visualization_histogram">
            <value name="DATA">
                <shadow type="text">
                    <field name="TEXT"></field>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};
```

**작업 B**: XML 변수 추가 (line 878 뒤)
```javascript
    const visualizationXML = moveCategory('visualization') || visualization(isInitialSetup, isStage, targetId, colors.visualization);
```

**작업 C**: everything 배열 수정 (line 891)
```javascript
        quantumXML, gap,
        visualizationXML
```

### 8. patches/scratch-vm/blocks/scratch3_visualization.js (새 파일)
**작업**: 런타임 구현
```javascript
const Cast = require('../util/cast');
const log = require('../util/log');

const QUANTUM_API_URL = 'https://quantum-backend-production-3180.up.railway.app';

class Scratch3VisualizationBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getPrimitives () {
        return {
            visualization_histogram: this.histogram
        };
    }

    histogram (args, util) {
        const data = Cast.toString(args.DATA);
        if (!data || data.trim() === '') {
            log.warn('Visualization: No data provided');
            return;
        }

        return fetch(`${QUANTUM_API_URL}/api/visualization/histogram`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: data })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success && result.image_base64) {
                if (this.runtime) {
                    this.runtime.emit('VISUALIZATION_SHOW_IMAGE', {
                        imageData: result.image_base64
                    });
                }
            }
        })
        .catch(error => log.warn(`Visualization error: ${error}`));
    }
}

module.exports = Scratch3VisualizationBlocks;
```

### 9. patches/scratch-vm/engine/runtime.js (line 45)
**작업**: 블록 패키지 등록
```javascript
    scratch3_quantum: require('../blocks/scratch3_quantum'),
    scratch3_visualization: require('../blocks/scratch3_visualization')
```

---

## 구현 순서

1. **scratch-blocks 수정** (constants.js, colours.js, messages.js, visualization.js, vertical_extensions.js)
2. **scratch-gui 수정** (themes/default/index.js, make-toolbox-xml.js)
3. **scratch-vm 패치** (scratch3_visualization.js, runtime.js)

---

## 회색 색상 팔레트

| 속성 | 값 |
|------|-----|
| primary | #8C8C8C |
| secondary | #7A7A7A |
| tertiary | #666666 |
| quaternary | #666666 |

---

## 백엔드 API 추가 (2개 파일)

### 10. quantum-backend/main.py
**작업**: 히스토그램 엔드포인트 추가

```python
from executor import QuantumExecutor, create_histogram

class HistogramRequest(BaseModel):
    data: str  # JSON string: "{'00': 512, '11': 512}"

class HistogramResponse(BaseModel):
    success: bool
    image_base64: Optional[str] = None
    error: Optional[str] = None

@app.post("/api/visualization/histogram", response_model=HistogramResponse)
async def create_histogram_chart(request: HistogramRequest):
    """Create histogram from quantum measurement data"""
    try:
        image_base64 = create_histogram(request.data)
        return HistogramResponse(success=True, image_base64=image_base64)
    except Exception as e:
        return HistogramResponse(success=False, error=str(e))
```

### 11. quantum-backend/executor.py
**작업**: matplotlib 히스토그램 생성 함수 추가

```python
import json
import base64
from io import BytesIO

try:
    import matplotlib
    matplotlib.use('Agg')  # Non-GUI backend
    import matplotlib.pyplot as plt
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

def create_histogram(data_str: str) -> str:
    """Create histogram image from quantum counts data"""
    if not MATPLOTLIB_AVAILABLE:
        raise ValueError("matplotlib is not installed")

    # Parse data (handles both dict-like string and JSON)
    data_str = data_str.strip()
    if data_str.startswith('{'):
        # Convert Python dict string to JSON format
        data_str = data_str.replace("'", '"')

    counts = json.loads(data_str)

    # Create histogram
    states = list(counts.keys())
    values = list(counts.values())

    fig, ax = plt.subplots(figsize=(8, 5))
    bars = ax.bar(states, values, color='#8C8C8C', edgecolor='#666666')

    ax.set_xlabel('Quantum State')
    ax.set_ylabel('Count')
    ax.set_title('Quantum Measurement Results')

    # Add value labels on bars
    for bar, val in zip(bars, values):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                str(val), ha='center', va='bottom', fontsize=10)

    plt.tight_layout()

    # Convert to base64
    buffer = BytesIO()
    plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close(fig)

    return f"data:image/png;base64,{image_base64}"
```

### 12. quantum-backend/requirements.txt (추가 의존성)
**작업**: matplotlib 추가
```
matplotlib
```

---

## 수정할 파일 총 목록 (12개)

| # | 파일 | 작업 |
|---|------|------|
| 1 | scratch-blocks/core/constants.js | 카테고리 ID 추가 |
| 2 | scratch-blocks/core/colours.js | 회색 색상 추가 |
| 3 | scratch-blocks/msg/messages.js | 메시지 추가 |
| 4 | scratch-blocks/blocks_vertical/visualization.js | 새 파일 생성 |
| 5 | scratch-blocks/blocks_vertical/vertical_extensions.js | 확장 등록 |
| 6 | scratch-gui/src/lib/themes/default/index.js | 테마 색상 |
| 7 | scratch-gui/src/lib/make-toolbox-xml.js | 툴박스 XML |
| 8 | patches/scratch-vm/blocks/scratch3_visualization.js | 새 파일 생성 |
| 9 | patches/scratch-vm/engine/runtime.js | 블록 등록 |
| 10 | quantum-backend/main.py | API 엔드포인트 |
| 11 | quantum-backend/executor.py | 히스토그램 함수 |
| 12 | quantum-backend/requirements.txt | matplotlib 의존성 |
