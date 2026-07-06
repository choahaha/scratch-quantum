// Parent side of the scratch-quantum postMessage bridge.
// Counterpart: scratch-gui/src/lib/embed-bridge-hoc.jsx.
//
// Incoming:  EMBED_READY, INIT_RESULT, QUANTUM_RUN_COMPLETED,
//            SUBMIT_RESPONSE, BRIDGE_ERROR
// Outgoing:  MISSION_INIT, SUBMIT_REQUEST

const BRIDGE_CHANNEL = 'scratch-quantum';
const BRIDGE_VERSION = 1;
const SUBMIT_TIMEOUT_MS = 10000;

const EMBED_ORIGIN = new URL(import.meta.env.VITE_SCRATCH_EMBED_URL).origin;

export const embedUrl = () => {
    const base = import.meta.env.VITE_SCRATCH_EMBED_URL.replace(/\/$/, '');
    // v=2: cache-buster — browsers permanently cached a broken 301 for the
    // original embed URL served before the serve.json fix.
    // (The editor defaults to English; add ?locale=ko here to force Korean.)
    return `${base}/embed.html?v=2`;
};

/**
 * Attach a bridge to an iframe. Returns a handle with send/request
 * helpers and a detach() cleanup.
 * @param {HTMLIFrameElement} iframe - the scratch embed iframe
 * @param {object} handlers - {onReady, onInitResult, onQuantumRun, onBridgeError}
 * @returns {{sendMissionInit: function, requestSubmit: function, detach: function}}
 */
export const attachBridge = (iframe, handlers = {}) => {
    const pending = new Map(); // requestId -> {resolve, timer}

    const post = message => {
        if (!iframe.contentWindow) return;
        iframe.contentWindow.postMessage({
            channel: BRIDGE_CHANNEL,
            version: BRIDGE_VERSION,
            ...message
        }, EMBED_ORIGIN);
    };

    const handleMessage = event => {
        if (event.origin !== EMBED_ORIGIN) return;
        if (event.source !== iframe.contentWindow) return;
        const data = event.data;
        if (!data || data.channel !== BRIDGE_CHANNEL) return;

        switch (data.type) {
        case 'EMBED_READY':
            if (handlers.onReady) handlers.onReady();
            break;
        case 'INIT_RESULT':
            if (handlers.onInitResult) handlers.onInitResult(data.payload);
            break;
        case 'QUANTUM_RUN_COMPLETED':
            if (handlers.onQuantumRun) handlers.onQuantumRun(data.payload);
            break;
        case 'SUBMIT_RESPONSE': {
            const entry = pending.get(data.requestId);
            if (entry) {
                clearTimeout(entry.timer);
                pending.delete(data.requestId);
                entry.resolve(data.payload);
            }
            break;
        }
        case 'BRIDGE_ERROR':
            if (handlers.onBridgeError) handlers.onBridgeError(data.payload);
            break;
        default:
            break;
        }
    };

    window.addEventListener('message', handleMessage);

    return {
        sendMissionInit: ({accessToken, refreshToken, missionId, starterProject}) => {
            post({
                type: 'MISSION_INIT',
                payload: {accessToken, refreshToken, missionId, starterProject: starterProject || null}
            });
        },
        requestSubmit: () => new Promise((resolve, reject) => {
            const requestId = crypto.randomUUID();
            const timer = setTimeout(() => {
                pending.delete(requestId);
                reject(new Error('No response from the editor. Make sure it has finished loading.'));
            }, SUBMIT_TIMEOUT_MS);
            pending.set(requestId, {resolve, timer});
            post({type: 'SUBMIT_REQUEST', requestId});
        }),
        detach: () => {
            window.removeEventListener('message', handleMessage);
            pending.forEach(entry => clearTimeout(entry.timer));
            pending.clear();
        }
    };
};
