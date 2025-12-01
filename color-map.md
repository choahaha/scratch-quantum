# Scratch 블록 색상표 (Color Map)

> **소스 파일**: `scratch-blocks/core/colours.js`

---

## 색상 스킴 구조

각 카테고리는 4단계 색상 스킴을 사용합니다:

| 단계 | 용도 |
|------|------|
| **Primary** | 블록 본체 색상 |
| **Secondary** | 블록 테두리/강조 |
| **Tertiary** | 더 어두운 강조 |
| **Quaternary** | 가장 어두운 강조 |

---

## 1. 기본 카테고리 색상

| 카테고리 | Primary | Secondary | Tertiary | Quaternary |
|----------|---------|-----------|----------|------------|
| **동작 (Motion)** | `#4C97FF` | `#4280D7` | `#3373CC` | `#3373CC` |
| **형태 (Looks)** | `#9966FF` | `#855CD6` | `#774DCB` | `#774DCB` |
| **소리 (Sounds)** | `#CF63CF` | `#C94FC9` | `#BD42BD` | `#BD42BD` |
| **이벤트 (Event)** | `#FFBF00` | `#E6AC00` | `#CC9900` | `#CC9900` |
| **제어 (Control)** | `#FFAB19` | `#EC9C13` | `#CF8B17` | `#CF8B17` |
| **감지 (Sensing)** | `#5CB1D6` | `#47A8D1` | `#2E8EB8` | `#2E8EB8` |
| **연산 (Operators)** | `#59C059` | `#46B946` | `#389438` | `#389438` |
| **변수 (Data)** | `#FF8C1A` | `#FF8000` | `#DB6E00` | `#DB6E00` |
| **리스트 (Data Lists)** | `#FF661A` | `#FF5500` | `#E64D00` | `#E64D00` |
| **나만의 블록 (More)** | `#FF6680` | `#FF4D6A` | `#FF3355` | `#FF3355` |

---

## 2. 확장 카테고리 색상

| 카테고리 | Primary | Secondary | Tertiary | Quaternary |
|----------|---------|-----------|----------|------------|
| **펜 (Pen)** | `#0FBD8C` | `#0DA57A` | `#0B8E69` | `#0B8E69` |

---

## 3. UI 요소 색상

| 요소 | 색상 코드 | 설명 |
|------|----------|------|
| **text** | `#FFFFFF` | 블록 내 텍스트 |
| **workspace** | `#F9F9F9` | 워크스페이스 배경 |
| **toolbox** | `#FFFFFF` | 툴박스 배경 |
| **toolboxHover** | `#4C97FF` | 툴박스 호버 |
| **toolboxSelected** | `#E9EEF2` | 툴박스 선택됨 |
| **toolboxText** | `#575E75` | 툴박스 텍스트 |
| **flyout** | `#F9F9F9` | 플라이아웃 배경 |
| **scrollbar** | `#CECDCE` | 스크롤바 |
| **textField** | `#FFFFFF` | 텍스트 필드 배경 |
| **textFieldText** | `#575E75` | 텍스트 필드 텍스트 |

---

## 4. 특수 효과 색상

| 요소 | 색상 코드 | 설명 |
|------|----------|------|
| **insertionMarker** | `#000000` (opacity: 0.2) | 삽입 마커 |
| **stackGlow** | `#FFF200` (opacity: 1) | 스택 글로우 |
| **replacementGlow** | `#FFFFFF` (opacity: 1) | 교체 글로우 |
| **colourPickerStroke** | `#FFFFFF` | 색상 선택기 테두리 |
| **fieldShadow** | `rgba(0,0,0,0.1)` | 필드 그림자 |
| **dropDownShadow** | `rgba(0,0,0,0.3)` | 드롭다운 그림자 |
| **numPadBackground** | `#547AB2` | 숫자패드 배경 |
| **numPadBorder** | `#435F91` | 숫자패드 테두리 |
| **valueReportBackground** | `#FFFFFF` | 값 리포트 배경 |
| **valueReportBorder** | `#AAAAAA` | 값 리포트 테두리 |

---

## 5. 빠른 참조 (Primary 색상만)

```
동작 (Motion)      #4C97FF  ████████
형태 (Looks)       #9966FF  ████████
소리 (Sounds)      #CF63CF  ████████
이벤트 (Event)     #FFBF00  ████████
제어 (Control)     #FFAB19  ████████
감지 (Sensing)     #5CB1D6  ████████
연산 (Operators)   #59C059  ████████
변수 (Data)        #FF8C1A  ████████
리스트 (Lists)     #FF661A  ████████
나만의블록 (More)  #FF6680  ████████
펜 (Pen)           #0FBD8C  ████████
```

---

## 6. 색상 커스터마이징

`Blockly.Colours.overrideColours()` 함수를 사용하여 색상을 재정의할 수 있습니다:

```javascript
Blockly.Colours.overrideColours({
  motion: {
    primary: "#4C97FF",
    secondary: "#4280D7",
    tertiary: "#3373CC",
    quaternary: "#3373CC"
  }
});
```
