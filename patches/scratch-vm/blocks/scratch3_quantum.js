const Cast = require('../util/cast');
const formatMessage = require('format-message');
const {fetchWithTimeout} = require('../util/fetch-with-timeout');
const log = require('../util/log');

// Railway 백엔드 API URL
const QUANTUM_API_URL = 'https://quantum-backend-production-3180.up.railway.app';

// API 요청 타임아웃 (30초)
const SERVER_TIMEOUT_MS = 30000;

// 전역 회로 상태 (모든 스프라이트에서 공유)
// preparedQubits / operationsStarted: 상태 준비 블록 순서·중복 검사용
// error: 검증 실패 메시지. 설정되면 이후 블록은 무시되고 run은 서버에 요청하지 않는다.
let globalCircuit = {
    blocks: [],
    result: '',
    counts: {},
    shotsDetail: [],
    preparedQubits: [],
    operationsStarted: false,
    error: null
};

// 학습자에게 보여줄 오류 문구 (현재 에디터 언어가 한국어면 한국어, 그 외에는 영어)
const MESSAGES = {
    en: {
        prefix: 'Error: ',
        noCircuit: 'Run the "create a circuit" block first.',
        prepareOrder: 'Put the "prepare qubit" blocks before any gate or measurement blocks.',
        alreadyPrepared: 'Qubit {qubit} is already prepared. Change the state in the existing prepare block instead.',
        badQubit: 'Qubit {qubit} is not in this circuit. Use a whole number from 0 to {max}.',
        badState: 'The state must be 0 or 1.'
    },
    ko: {
        prefix: '오류: ',
        noCircuit: '먼저 회로 만들기 블록을 실행해 주세요.',
        prepareOrder: '상태 준비 블록을 게이트와 측정 블록보다 앞에 놓아 주세요.',
        alreadyPrepared: '큐비트 {qubit}은(는) 이미 준비했어요. 기존 준비 블록의 상태를 변경해 주세요.',
        badQubit: '회로에 없는 큐비트 번호예요({qubit}). 0부터 {max}까지의 정수를 입력해 주세요.',
        badState: '상태는 0 또는 1만 선택할 수 있어요.'
    }
};

const getLocale = () => {
    const locale = formatMessage.setup().locale || 'en';
    return locale.toLowerCase().startsWith('ko') ? 'ko' : 'en';
};

const message = (key, params = {}) => {
    const text = MESSAGES[getLocale()][key];
    return text.replace(/\{(\w+)\}/g, (match, name) => String(params[name]));
};

// 검증 실패: 이전 결과를 지우고 오류를 기록한다. 같은 회로의 이후 블록은 무시된다.
const failCircuit = text => {
    globalCircuit.error = text;
    globalCircuit.result = `${MESSAGES[getLocale()].prefix}${text}`;
    globalCircuit.counts = {};
    globalCircuit.shotsDetail = [];
    log.warn(`Quantum: ${text}`);
};

// 게이트·측정 블록 공통: 오류 상태면 무시하고, 아니면 회로에 추가하고 준비 단계를 닫는다.
const addOperation = block => {
    if (globalCircuit.error) return;
    globalCircuit.blocks.push(block);
    globalCircuit.operationsStarted = true;
};

// Update the existing object instead of reassigning (keeps the runtime reference)
const resetCircuit = () => {
    globalCircuit.blocks = [];
    globalCircuit.result = '';
    globalCircuit.counts = {};
    globalCircuit.shotsDetail = [];
    globalCircuit.preparedQubits = [];
    globalCircuit.operationsStarted = false;
    globalCircuit.error = null;
};

// True when the running block is wrapped (at any depth) by a quantum_run C-block
const isInsideRun = util => util.thread.stack.some(blockId => {
    const block = util.target.blocks.getBlock(blockId);
    return block && block.opcode === 'quantum_run';
});

const hasCircuit = () => globalCircuit.blocks.length > 0 &&
    globalCircuit.blocks[0].opcode === 'quantum_createCircuit';

class Scratch3QuantumBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        // Share circuit state via runtime for visualization blocks
        runtime.quantumCircuit = globalCircuit;
    }

    getPrimitives () {
        return {
            quantum_createCircuit: this.createCircuit,
            quantum_prepareState: this.prepareState,
            quantum_gateH: this.gateH,
            quantum_gateX: this.gateX,
            quantum_gateY: this.gateY,
            quantum_gateZ: this.gateZ,
            quantum_gateCX: this.gateCX,
            quantum_measureAll: this.measureAll,
            quantum_run: this.run,
            quantum_getResult: this.getResult,
            quantum_getResultData: this.getResultData,
            quantum_getShotResult: this.getShotResult,
            quantum_getQubitOfShot: this.getQubitOfShot
        };
    }

    createCircuit (args, util) {
        const numQubits = Cast.toNumber(args.NUM_QUBITS);

        // Inside a run, an earlier error (e.g. "prepare" placed before this block)
        // must still fail the run, so a later "create a circuit" can't clear it.
        if (globalCircuit.error && isInsideRun(util)) return;

        resetCircuit();
        globalCircuit.blocks.push({
            opcode: 'quantum_createCircuit',
            args: {
                NUM_QUBITS: numQubits
            }
        });

        log.log(`Quantum: Created circuit with ${numQubits} qubits`);
    }

    // 회로 시작 부분에서 큐비트의 초기 상태(0 또는 1)를 고른다.
    // 백엔드는 1 준비를 X 게이트 하나로 바꾸므로, 게이트·측정 이전에 큐비트당 한 번만 허용한다.
    prepareState (args) {
        if (globalCircuit.error) return;

        const rawQubit = args.QUBIT;
        const rawState = String(args.STATE);
        const block = {
            opcode: 'quantum_prepareState',
            args: {QUBIT: rawQubit, STATE: rawState}
        };

        if (!hasCircuit()) {
            failCircuit(message('noCircuit'));
            return;
        }
        // 문제가 된 블록도 기록해 둔다: 미션 제출 시 백엔드가 같은 규칙으로 다시 거절한다.
        globalCircuit.blocks.push(block);

        if (globalCircuit.operationsStarted) {
            failCircuit(message('prepareOrder'));
            return;
        }

        const numQubits = Cast.toNumber(globalCircuit.blocks[0].args.NUM_QUBITS);
        const qubit = Number(rawQubit);
        if (String(rawQubit).trim() === '' || !Number.isInteger(qubit) || qubit < 0 || qubit >= numQubits) {
            failCircuit(message('badQubit', {qubit: rawQubit, max: Math.max(numQubits - 1, 0)}));
            return;
        }
        if (rawState !== '0' && rawState !== '1') {
            failCircuit(message('badState'));
            return;
        }
        if (globalCircuit.preparedQubits.indexOf(qubit) !== -1) {
            failCircuit(message('alreadyPrepared', {qubit}));
            return;
        }

        block.args = {QUBIT: qubit, STATE: Number(rawState)};
        globalCircuit.preparedQubits.push(qubit);
        log.log(`Quantum: Prepared qubit ${qubit} in state ${rawState}`);
    }

    gateH (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        addOperation({
            opcode: 'quantum_gateH',
            args: { QUBIT: qubit }
        });
        log.log(`Quantum: Added H gate on qubit ${qubit}`);
    }

    gateX (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        addOperation({
            opcode: 'quantum_gateX',
            args: { QUBIT: qubit }
        });
    }

    gateY (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        addOperation({
            opcode: 'quantum_gateY',
            args: { QUBIT: qubit }
        });
    }

    gateZ (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        addOperation({
            opcode: 'quantum_gateZ',
            args: { QUBIT: qubit }
        });
    }

    gateCX (args) {
        const control = Cast.toNumber(args.CONTROL);
        const target = Cast.toNumber(args.TARGET);
        addOperation({
            opcode: 'quantum_gateCX',
            args: { CONTROL: control, TARGET: target }
        });
    }

    measureAll () {
        addOperation({
            opcode: 'quantum_measureAll',
            args: {}
        });
        log.log('Quantum: Added measureAll');
    }

    run (args, util) {
        // C-block: first entry runs the wrapped blocks (create circuit / gates /
        // measure) once so they accumulate into globalCircuit, then on re-entry we
        // send the assembled circuit to the backend.
        if (typeof util.stackFrame.ranBody === 'undefined') {
            util.stackFrame.ranBody = true;
            // A run with wrapped blocks starts from a clean slate, so a previous
            // run's circuit, preparations or results can't leak into this one.
            // (An empty run keeps the old behavior of sending blocks run above it.)
            if (util.target.blocks.getBranch(util.thread.peekStack(), 1)) {
                resetCircuit();
            }
            util.startBranch(1, true); // execute SUBSTACK once, then re-enter run
            return;
        }

        const shots = Cast.toNumber(args.SHOTS);

        if (!globalCircuit.error && !hasCircuit()) {
            failCircuit(message('noCircuit'));
        }
        if (globalCircuit.error) {
            // 검증 실패: 서버에 요청하지 않고 오류 문구를 결과로 남긴다.
            globalCircuit.result = `${MESSAGES[getLocale()].prefix}${globalCircuit.error}`;
            return Promise.resolve();
        }

        log.log(`Quantum: Running circuit with ${shots} shots, blocks:`, JSON.stringify(globalCircuit.blocks));

        return fetchWithTimeout(`${QUANTUM_API_URL}/api/quantum/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                blocks: globalCircuit.blocks,
                shots: shots,
                locale: getLocale()
            })
        }, SERVER_TIMEOUT_MS)
            .then(response => response.json())
            .then(data => {
                log.log('Quantum: Response:', data);
                if (data.success) {
                    globalCircuit.result = data.result_text || data.result;
                    globalCircuit.counts = data.counts || {};
                    globalCircuit.shotsDetail = data.shots_detail || [];
                    // Notify listeners (e.g. the mission platform embed
                    // bridge) that a run finished with fresh results.
                    this.runtime.emit('QUANTUM_RUN_COMPLETED', {
                        blocks: JSON.parse(JSON.stringify(globalCircuit.blocks)),
                        counts: globalCircuit.counts,
                        shotsDetail: globalCircuit.shotsDetail,
                        resultText: globalCircuit.result
                    });
                } else {
                    globalCircuit.result = `Error: ${data.error}`;
                    globalCircuit.counts = {};
                }
            })
            .catch(error => {
                log.warn(`Quantum execution error: ${error}`);
                globalCircuit.result = `Error: ${error.message}`;
            });
    }

    getResult () {
        return globalCircuit.result || '';
    }

    // counts: "0: 49, 1: 51" (state order, observed states only)
    // state:  "1, 0" (observed states, most frequent first)
    getResultData (args) {
        const dataType = args.DATA_TYPE || 'state';
        const counts = globalCircuit.counts || {};
        const states = Object.keys(counts);
        if (dataType === 'counts') {
            return states.sort()
                .map(state => `${state}: ${counts[state]}`)
                .join(', ');
        }
        return states.sort((a, b) => (counts[b] - counts[a]) || (a < b ? -1 : 1))
            .join(', ');
    }

    getShotResult (args) {
        const index = Cast.toNumber(args.INDEX);
        const detail = globalCircuit.shotsDetail;
        if (!detail || detail.length === 0) return '';
        // 1-based index (Scratch 스타일)
        const i = Math.round(index) - 1;
        if (i < 0 || i >= detail.length) return '';
        return detail[i];
    }

    getQubitOfShot (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        const shotIndex = Cast.toNumber(args.SHOT);
        const detail = globalCircuit.shotsDetail;
        if (!detail || detail.length === 0) return '';
        // 1-based shot index (Scratch 스타일)
        const i = Math.round(shotIndex) - 1;
        if (i < 0 || i >= detail.length) return '';
        const bitString = detail[i];
        // Qiskit 비트 순서: 오른쪽이 qubit 0
        const q = Math.round(qubit);
        const bitIndex = bitString.length - 1 - q;
        if (bitIndex < 0 || bitIndex >= bitString.length) return '';
        return bitString[bitIndex];
    }
}

module.exports = Scratch3QuantumBlocks;
