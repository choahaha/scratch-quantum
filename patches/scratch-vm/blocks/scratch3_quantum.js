const Cast = require('../util/cast');
const {fetchWithTimeout} = require('../util/fetch-with-timeout');
const log = require('../util/log');

// Railway 백엔드 API URL
const QUANTUM_API_URL = 'https://quantum-backend-production-3180.up.railway.app';

// API 요청 타임아웃 (30초)
const SERVER_TIMEOUT_MS = 30000;

// 전역 회로 상태 (모든 스프라이트에서 공유)
let globalCircuit = {
    blocks: [],
    result: '',
    counts: {}
};

class Scratch3QuantumBlocks {
    constructor (runtime) {
        this.runtime = runtime;
        // Share circuit state via runtime for visualization blocks
        runtime.quantumCircuit = globalCircuit;
    }

    getPrimitives () {
        return {
            quantum_createCircuit: this.createCircuit,
            quantum_gateH: this.gateH,
            quantum_gateX: this.gateX,
            quantum_gateY: this.gateY,
            quantum_gateZ: this.gateZ,
            quantum_gateCX: this.gateCX,
            quantum_measureAll: this.measureAll,
            quantum_run: this.run,
            quantum_getResult: this.getResult,
            quantum_getResultData: this.getResultData
        };
    }

    createCircuit (args) {
        const numQubits = Cast.toNumber(args.NUM_QUBITS);

        // Update existing object instead of reassigning (keeps runtime reference)
        globalCircuit.blocks = [{
            opcode: 'quantum_createCircuit',
            args: {
                NUM_QUBITS: numQubits
            }
        }];
        globalCircuit.result = '';
        globalCircuit.counts = {};

        log.log(`Quantum: Created circuit with ${numQubits} qubits`);
    }

    gateH (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        globalCircuit.blocks.push({
            opcode: 'quantum_gateH',
            args: { QUBIT: qubit }
        });
        log.log(`Quantum: Added H gate on qubit ${qubit}`);
    }

    gateX (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        globalCircuit.blocks.push({
            opcode: 'quantum_gateX',
            args: { QUBIT: qubit }
        });
    }

    gateY (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        globalCircuit.blocks.push({
            opcode: 'quantum_gateY',
            args: { QUBIT: qubit }
        });
    }

    gateZ (args) {
        const qubit = Cast.toNumber(args.QUBIT);
        globalCircuit.blocks.push({
            opcode: 'quantum_gateZ',
            args: { QUBIT: qubit }
        });
    }

    gateCX (args) {
        const control = Cast.toNumber(args.CONTROL);
        const target = Cast.toNumber(args.TARGET);
        globalCircuit.blocks.push({
            opcode: 'quantum_gateCX',
            args: { CONTROL: control, TARGET: target }
        });
    }

    measureAll () {
        globalCircuit.blocks.push({
            opcode: 'quantum_measureAll',
            args: {}
        });
        log.log('Quantum: Added measureAll');
    }

    run (args) {
        const shots = Cast.toNumber(args.SHOTS);

        if (globalCircuit.blocks.length === 0 ||
            globalCircuit.blocks[0].opcode !== 'quantum_createCircuit') {
            globalCircuit.result = 'Error: 먼저 "양자 회로 만들기" 블록을 사용하세요!';
            log.warn('Quantum: No circuit created before run');
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
                shots: shots
            })
        }, SERVER_TIMEOUT_MS)
            .then(response => response.json())
            .then(data => {
                log.log('Quantum: Response:', data);
                if (data.success) {
                    globalCircuit.result = data.result_text || data.result;
                    globalCircuit.counts = data.counts || {};
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

    getResultData (args) {
        const dataType = args.DATA_TYPE || 'state';
        if (dataType === 'counts') {
            return JSON.stringify(globalCircuit.counts || {});
        }
        return globalCircuit.result || '';
    }
}

module.exports = Scratch3QuantumBlocks;
