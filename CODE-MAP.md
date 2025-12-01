# Scratch Quantum - Code Map

이 문서는 `scratch-gui`와 `scratch-blocks` 두 저장소의 코드 구조를 상세히 분석한 결과입니다.

---

## 목차

1. [전체 아키텍처 개요](#1-전체-아키텍처-개요)
2. [scratch-gui 상세 분석](#2-scratch-gui-상세-분석)
3. [scratch-blocks 상세 분석](#3-scratch-blocks-상세-분석)
4. [통합 포인트](#4-통합-포인트)
5. [주요 파일 빠른 참조](#5-주요-파일-빠른-참조)

---

## 1. 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           scratch-gui                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   MenuBar   │  │    Stage    │  │  TargetPane │  │   Modals    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│         │                │                │                │            │
│         └────────────────┴────────────────┴────────────────┘            │
│                                   │                                      │
│                        ┌──────────┴──────────┐                          │
│                        │    Redux Store      │                          │
│                        │  (33 reducers)      │                          │
│                        └──────────┬──────────┘                          │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ scratch-blocks│         │  scratch-vm   │         │ scratch-paint │
│ (블록 에디터)  │ ◄──────► │   (런타임)    │         │ (그래픽 편집) │
└───────────────┘         └───────────────┘         └───────────────┘
```

### 모듈 역할 요약

| 모듈 | 역할 | 주요 기능 |
|------|------|----------|
| **scratch-gui** | 사용자 인터페이스 | React 컴포넌트, Redux 상태 관리, 프로젝트 저장/로드 |
| **scratch-blocks** | 블록 에디터 | Blockly 기반 블록 편집, 드래그앤드롭, 블록 정의 |
| **scratch-vm** | 런타임 엔진 | 블록 실행, 스프라이트 관리, 이벤트 처리 |
| **scratch-paint** | 그래픽 에디터 | 코스튬/배경 편집, 벡터/비트맵 도구 |

---

## 2. scratch-gui 상세 분석

### 2.1 디렉토리 구조

```
scratch-gui/
├── src/
│   ├── index.js                    # 라이브러리 진입점 (exports)
│   ├── components/                 # 69개 프레젠테이션 컴포넌트
│   │   ├── gui/gui.jsx            # 메인 GUI 컴포넌트
│   │   ├── menu-bar/              # 상단 메뉴바 (40+ 하위 컴포넌트)
│   │   ├── stage/                 # 스테이지 렌더링
│   │   ├── sprite-selector/       # 스프라이트 선택기
│   │   ├── blocks/                # 블록 에디터 래퍼
│   │   ├── costume-tab/           # 코스튬 탭
│   │   ├── sound-tab/             # 사운드 탭
│   │   └── ...                    # 기타 UI 컴포넌트
│   │
│   ├── containers/                 # 66개 Redux 연결 컨테이너
│   │   ├── gui.jsx                # 루트 GUI 컨테이너
│   │   ├── blocks.jsx             # 블록 에디터 컨테이너
│   │   ├── stage.jsx              # 스테이지 컨테이너
│   │   └── ...
│   │
│   ├── reducers/                   # 33개 Redux 리듀서
│   │   ├── gui.js                 # 메인 리듀서 (모든 슬라이스 결합)
│   │   ├── project-state.js       # 프로젝트 로딩/저장 상태
│   │   ├── targets.js             # 스프라이트/배경 데이터
│   │   ├── vm.js                  # VM 인스턴스 참조
│   │   ├── modals.js              # 모달 가시성 상태
│   │   ├── editor-tab.js          # 활성 탭 (블록/코스튬/사운드)
│   │   └── ...
│   │
│   ├── lib/                        # 54개 유틸리티 및 HOC
│   │   ├── app-state-hoc.jsx      # Redux Provider 생성
│   │   ├── vm-manager-hoc.jsx     # VM 초기화 관리
│   │   ├── vm-listener-hoc.jsx    # VM 이벤트 리스너
│   │   ├── blocks.js              # scratch-blocks 통합
│   │   ├── make-toolbox-xml.js    # 툴박스 XML 생성
│   │   ├── storage.js             # 스토리지 API
│   │   └── libraries/             # 내장 라이브러리 (스프라이트, 배경 등)
│   │
│   ├── css/                        # 글로벌 스타일
│   └── playground/                 # 개발용 플레이그라운드
│
├── test/                           # 테스트 코드
│   ├── unit/                      # 유닛 테스트
│   ├── integration/               # 통합 테스트 (18+ 파일)
│   └── fixtures/                  # 테스트 데이터
│
├── webpack.config.js               # Webpack 설정
└── package.json                    # 패키지 설정
```

### 2.2 컴포넌트 계층 구조

```
index.html
  └─ playground/index.jsx (진입점)
      └─ AppStateHOC (Redux Provider)
          └─ HashParserHOC
              └─ GUI Container
                  └─ [18개 HOC 래퍼]:
                      ├─ LocalizationHOC (다국어)
                      ├─ ErrorBoundaryHOC (에러 처리)
                      ├─ FontLoaderHOC (폰트 로딩)
                      ├─ ProjectFetcherHOC (프로젝트 불러오기)
                      ├─ ProjectSaverHOC (프로젝트 저장)
                      ├─ VMListenerHOC (VM 이벤트)
                      ├─ VMManagerHOC (VM 관리)
                      └─ ...
                          └─ GUIComponent
                              ├─ MenuBar (메뉴바)
                              ├─ [Tabs Container]:
                              │   ├─ Blocks Editor (scratch-blocks)
                              │   ├─ Costumes Tab (scratch-paint)
                              │   └─ Sounds Tab
                              ├─ Stage (캔버스)
                              ├─ TargetPane (스프라이트 선택)
                              └─ [Modals...]
```

### 2.3 Redux 상태 구조

```javascript
state = {
  locales: {
    isRtl,           // RTL 언어 여부
    locale,          // 현재 로케일
    messages         // 번역 메시지
  },
  scratchGui: {
    alerts,          // 알림 메시지
    editorTab,       // 활성 탭 (0: 블록, 1: 코스튬, 2: 사운드)
    mode: {
      isFullScreen,  // 전체화면 여부
      isPlayerOnly,  // 플레이어 전용 모드
      hasEverEnteredEditor
    },
    modals: {        // 모달 가시성
      backdropLibrary,
      costumeLibrary,
      extensionLibrary,
      tipsLibrary,
      ...
    },
    monitors,        // 변수 모니터
    projectChanged,  // 프로젝트 수정 여부
    projectState,    // 로딩/저장 상태 머신
    projectTitle,    // 프로젝트 이름
    targets,         // 스프라이트/배경 목록
    toolbox,         // 블록 툴박스 상태
    vm,              // VM 인스턴스 참조
    vmStatus,        // VM 실행 상태
    ...
  },
  scratchPaint: { ... }  // 페인트 에디터 상태
}
```

### 2.4 주요 HOC (Higher-Order Components)

| HOC | 파일 | 역할 |
|-----|------|------|
| **AppStateHOC** | `lib/app-state-hoc.jsx` | Redux 스토어 생성 및 Provider 제공 |
| **VMManagerHOC** | `lib/vm-manager-hoc.jsx` | VM 초기화, 프로젝트 로딩 |
| **VMListenerHOC** | `lib/vm-listener-hoc.jsx` | VM 이벤트 → Redux 액션 변환 |
| **ProjectFetcherHOC** | `lib/project-fetcher-hoc.jsx` | 서버에서 프로젝트 불러오기 |
| **ProjectSaverHOC** | `lib/project-saver-hoc.jsx` | 서버로 프로젝트 저장 |
| **LocalizationHOC** | `lib/localization-hoc.jsx` | 다국어 IntlProvider 설정 |
| **ErrorBoundaryHOC** | `lib/error-boundary-hoc.jsx` | React 에러 바운더리 |
| **SBFileUploaderHOC** | `lib/sb-file-uploader-hoc.jsx` | .sb2/.sb3 파일 업로드 |

### 2.5 주요 컴포넌트 파일

| 컴포넌트 | 경로 | 역할 |
|----------|------|------|
| **GUI** | `components/gui/gui.jsx` | 메인 레이아웃 컴포넌트 |
| **MenuBar** | `components/menu-bar/menu-bar.jsx` | 상단 메뉴 (파일, 편집, 언어 등) |
| **Stage** | `components/stage/stage.jsx` | 캔버스 렌더링 영역 |
| **Blocks** | `containers/blocks.jsx` | scratch-blocks 통합 |
| **TargetPane** | `containers/target-pane.jsx` | 스프라이트/변수 편집 패널 |
| **CostumeTab** | `containers/costume-tab.jsx` | 코스튬 편집 탭 |
| **SoundTab** | `containers/sound-tab.jsx` | 사운드 편집 탭 |

---

## 3. scratch-blocks 상세 분석

### 3.1 디렉토리 구조

```
scratch-blocks/
├── core/                           # Blockly 엔진 수정본 (97개 파일)
│   ├── blockly.js                 # 최상위 네임스페이스
│   ├── inject.js                  # DOM에 워크스페이스 주입
│   ├── workspace_svg.js           # SVG 워크스페이스 (2,267줄)
│   ├── block.js                   # 블록 기본 클래스 (1,837줄)
│   ├── block_svg.js               # SVG 블록 렌더링 (1,567줄)
│   ├── block_render_svg_vertical.js  # 수직 블록 렌더링 (1,834줄)
│   ├── toolbox.js                 # 툴박스 카테고리 (801줄)
│   ├── flyout_base.js             # 플라이아웃 기본 (923줄)
│   ├── field_*.js                 # 각종 필드 컴포넌트
│   ├── gesture.js                 # 터치/마우스 제스처 (1,011줄)
│   ├── xml.js                     # XML 직렬화 (919줄)
│   ├── connection.js              # 블록 연결 로직 (766줄)
│   ├── variables.js               # 변수 관리
│   ├── procedures.js              # 프로시저 블록 처리
│   └── ...
│
├── blocks_vertical/                # 표준 스크래치 블록 (12개 파일)
│   ├── motion.js                  # 동작 블록 (18개)
│   ├── looks.js                   # 형태 블록 (23개)
│   ├── sound.js                   # 소리 블록 (7개)
│   ├── control.js                 # 제어 블록 (14개)
│   ├── event.js                   # 이벤트 블록 (10개)
│   ├── sensing.js                 # 감지 블록 (20+개)
│   ├── operators.js               # 연산 블록 (13개)
│   ├── data.js                    # 데이터 블록 (18개)
│   ├── procedures.js              # 나만의 블록 (4개)
│   ├── extensions.js              # 확장 블록 (8개)
│   ├── vertical_extensions.js     # 확장 함수 정의
│   └── default_toolbox.js         # 기본 툴박스 XML
│
├── blocks_horizontal/              # ScratchJr 스타일 블록 (4개 파일)
│   ├── control.js                 # 제어 블록
│   ├── event.js                   # 이벤트 블록
│   ├── wedo.js                    # WeDo 하드웨어
│   └── default_toolbox.js         # 가로 툴박스
│
├── blocks_common/                  # 공통 블록 (5개 파일)
│   ├── math.js                    # 숫자 필드
│   ├── text.js                    # 텍스트 필드
│   ├── colour.js                  # 색상 필드
│   ├── matrix.js                  # 매트릭스 필드
│   └── note.js                    # 음표 필드
│
├── msg/                            # 다국어 지원
│   ├── messages.js                # 영어 메시지 원본
│   ├── scratch_msgs.js            # 모든 언어 (1.1MB)
│   └── json/                      # JSON 번역 파일
│
├── media/                          # 미디어 자산
│   ├── icons/                     # 카테고리 아이콘 (42개)
│   ├── extensions/                # 확장 아이콘
│   └── sprites.svg                # 아이콘 스프라이트
│
├── tests/                          # 테스트
│   ├── jsunit/                    # 유닛 테스트 (34+ 파일)
│   └── *.html                     # 플레이그라운드
│
├── build.py                        # Closure Compiler 빌드
├── webpack.config.js               # Webpack 설정
└── package.json                    # 패키지 설정
```

### 3.2 블록 카테고리 및 색상

| 카테고리 | 파일 | 블록 수 | 색상 |
|----------|------|--------|------|
| **동작 (Motion)** | `motion.js` | 18 | #4C97FF (파랑) |
| **형태 (Looks)** | `looks.js` | 23 | #9966FF (보라) |
| **소리 (Sound)** | `sound.js` | 7 | #CF63CF (분홍) |
| **이벤트 (Event)** | `event.js` | 10 | #FFBF00 (노랑) |
| **제어 (Control)** | `control.js` | 14 | #FFAB19 (주황) |
| **감지 (Sensing)** | `sensing.js` | 20+ | #5CB1D6 (하늘) |
| **연산 (Operators)** | `operators.js` | 13 | #59C059 (초록) |
| **변수 (Data)** | `data.js` | 18 | #FF8C1A (오렌지) |
| **나만의 블록** | `procedures.js` | 4 | #FF6680 (빨강) |

> 상세 색상 정보는 [color-map.md](./color-map.md) 참조

### 3.3 블록 정의 패턴

```javascript
// 기본 블록 정의 패턴
Blockly.Blocks['motion_movesteps'] = {
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MOTION_MOVESTEPS,  // "%1 만큼 움직이기"
      "args0": [{
        "type": "input_value",
        "name": "STEPS"
      }],
      "category": Blockly.Categories.motion,
      "extensions": ["colours_motion", "shape_statement"]
    });
  }
};
```

### 3.4 확장 시스템

**색상 확장**:
- `colours_motion`, `colours_looks`, `colours_sound` 등
- 4단계 색상 스킴 (primary, secondary, tertiary, quaternary)

**모양 확장**:
- `shape_statement` - 일반 문장 블록 (위아래 연결)
- `shape_hat` - 모자 블록 (이벤트 시작, 위 연결 없음)
- `shape_end` - 종료 블록 (아래 연결 없음)

**출력 확장**:
- `output_number` - 둥근 숫자 리포터
- `output_string` - 둥근 문자열 리포터
- `output_boolean` - 육각형 불리언 리포터

### 3.5 필드 컴포넌트

| 필드 | 파일 | 용도 |
|------|------|------|
| **field_textinput** | `core/field_textinput.js` | 텍스트 입력 |
| **field_dropdown** | `core/field_dropdown.js` | 드롭다운 메뉴 |
| **field_number** | `core/field_number.js` | 숫자 입력 |
| **field_variable** | `core/field_variable.js` | 변수 선택기 |
| **field_colour_slider** | `core/field_colour_slider.js` | 색상 슬라이더 |
| **field_angle** | `core/field_angle.js` | 각도 선택기 |
| **field_note** | `core/field_note.js` | 음표 선택기 (850줄) |
| **field_matrix** | `core/field_matrix.js` | 매트릭스 그리드 |

### 3.6 주요 Core 파일

| 파일 | 줄 수 | 역할 |
|------|-------|------|
| `workspace_svg.js` | 2,267 | SVG 워크스페이스 구현 |
| `block.js` | 1,837 | 블록 기본 클래스 |
| `block_render_svg_vertical.js` | 1,834 | 수직 블록 SVG 렌더링 |
| `block_svg.js` | 1,567 | SVG 블록 그리기 |
| `css.js` | 1,351 | 동적 CSS 주입 |
| `gesture.js` | 1,011 | 터치/마우스 제스처 |
| `utils.js` | 948 | 유틸리티 함수 |
| `flyout_base.js` | 923 | 플라이아웃 기본 |
| `xml.js` | 919 | XML 직렬화/역직렬화 |
| `scrollbar.js` | 875 | 커스텀 스크롤바 |
| `field_note.js` | 850 | 음표 필드 |
| `toolbox.js` | 801 | 툴박스 카테고리 |
| `field.js` | 807 | 필드 기본 클래스 |
| `connection.js` | 766 | 블록 연결 로직 |
| `dropdowndiv.js` | 763 | 드롭다운 컨테이너 |
| `flyout_vertical.js` | 770 | 수직 플라이아웃 |

---

## 4. 통합 포인트

### 4.1 scratch-gui ↔ scratch-blocks 연결

```
scratch-gui/src/containers/blocks.jsx
         │
         ▼
scratch-gui/src/lib/blocks.js  ◄─── scratch-blocks 동적 로딩
         │
         ├─── VMScratchBlocks() 함수로 블록 초기화
         ├─── 동적 블록 정의 (소리, 변수, 스프라이트 메뉴)
         └─── 테마 색상 적용
```

**주요 파일**:
- `scratch-gui/src/lib/blocks.js` - scratch-blocks ↔ VM 연결
- `scratch-gui/src/lib/make-toolbox-xml.js` - 툴박스 XML 동적 생성
- `scratch-gui/src/containers/blocks.jsx` - Blockly 워크스페이스 관리

### 4.2 scratch-gui ↔ scratch-vm 연결

```javascript
// VM 이벤트 → Redux 액션 변환 (vmListenerHOC)
vm.on('targetsUpdate', targets => dispatch(updateTargets(targets)));
vm.on('MONITORS_UPDATE', monitors => dispatch(updateMonitors(monitors)));
vm.on('PROJECT_CHANGED', () => dispatch(setProjectChanged()));
vm.on('PROJECT_RUN_START', () => dispatch(setRunningState(true)));
```

**주요 HOC**:
- `VMManagerHOC` - VM 초기화, AudioEngine 연결
- `VMListenerHOC` - VM 이벤트 리스닝

### 4.3 데이터 흐름

```
사용자 액션 → Component 이벤트
     │
     ▼
Redux Action (dispatch)
     │
     ▼
Redux Store 업데이트
     │
     ▼
mapStateToProps → Component Props
     │
     ▼
컴포넌트 리렌더링
     │
     ▼
화면 업데이트

VM 이벤트 → vmListenerHOC
     │
     ▼
Redux Dispatch
     │
     ▼
상태 업데이트 & 리렌더링
```

---

## 5. 주요 파일 빠른 참조

### scratch-gui 핵심 파일

| 목적 | 파일 경로 |
|------|----------|
| 라이브러리 진입점 | `src/index.js` |
| 메인 GUI 컴포넌트 | `src/components/gui/gui.jsx` |
| 루트 컨테이너 | `src/containers/gui.jsx` |
| Redux 메인 리듀서 | `src/reducers/gui.js` |
| 블록 에디터 컨테이너 | `src/containers/blocks.jsx` |
| 블록 통합 로직 | `src/lib/blocks.js` |
| 툴박스 XML 생성 | `src/lib/make-toolbox-xml.js` |
| VM 관리 HOC | `src/lib/vm-manager-hoc.jsx` |
| VM 이벤트 HOC | `src/lib/vm-listener-hoc.jsx` |
| 스토어 생성 HOC | `src/lib/app-state-hoc.jsx` |
| 스테이지 컴포넌트 | `src/containers/stage.jsx` |
| 스프라이트 선택기 | `src/containers/sprite-selector.jsx` |

### scratch-blocks 핵심 파일

| 목적 | 파일 경로 |
|------|----------|
| 최상위 네임스페이스 | `core/blockly.js` |
| 워크스페이스 주입 | `core/inject.js` |
| SVG 워크스페이스 | `core/workspace_svg.js` |
| 블록 기본 클래스 | `core/block.js` |
| 블록 SVG 렌더링 | `core/block_svg.js` |
| 수직 렌더링 | `core/block_render_svg_vertical.js` |
| 툴박스 | `core/toolbox.js` |
| 플라이아웃 | `core/flyout_base.js` |
| XML 직렬화 | `core/xml.js` |
| 블록 연결 | `core/connection.js` |
| 변수 관리 | `core/variables.js` |
| 프로시저 처리 | `core/procedures.js` |
| 기본 툴박스 XML | `blocks_vertical/default_toolbox.js` |
| 블록 확장 함수 | `blocks_vertical/vertical_extensions.js` |

### 블록 정의 파일

| 카테고리 | 파일 |
|----------|------|
| 동작 | `blocks_vertical/motion.js` |
| 형태 | `blocks_vertical/looks.js` |
| 소리 | `blocks_vertical/sound.js` |
| 이벤트 | `blocks_vertical/event.js` |
| 제어 | `blocks_vertical/control.js` |
| 감지 | `blocks_vertical/sensing.js` |
| 연산 | `blocks_vertical/operators.js` |
| 데이터 | `blocks_vertical/data.js` |
| 나만의 블록 | `blocks_vertical/procedures.js` |

---

## 코드 통계

### scratch-gui
- **컴포넌트**: 69개 (프레젠테이션)
- **컨테이너**: 66개 (Redux 연결)
- **리듀서**: 33개
- **HOC**: 18개
- **유틸리티**: 54개 파일

### scratch-blocks
- **Core 파일**: 97개 (~44,621줄)
- **Vertical 블록**: 12개 (~6,072줄)
- **Horizontal 블록**: 4개 (~1,300줄)
- **Common 블록**: 5개 (~300줄)
- **총 코드량**: ~52,300줄

---

*이 문서는 Scratch 3.0 codebase를 이해하고 수정하는 데 필요한 핵심 정보를 제공합니다.*
