const Cast = require('../util/cast');
const {fetchWithTimeout} = require('../util/fetch-with-timeout');
const log = require('../util/log');

// Railway 백엔드 API URL
const QUANTUM_API_URL = 'https://quantum-backend-production-3180.up.railway.app';

// API 요청 타임아웃 (30초)
const SERVER_TIMEOUT_MS = 30000;

class Scratch3VisualizationBlocks {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getPrimitives () {
        return {
            visualization_histogram: this.histogram.bind(this)
        };
    }

    histogram (args) {
        const data = Cast.toString(args.DATA);

        if (!data || data.trim() === '') {
            log.warn('Visualization: No data provided');
            return;
        }

        // Return a Promise to wait until the modal is closed
        return new Promise(resolve => {
            fetchWithTimeout(`${QUANTUM_API_URL}/api/visualization/histogram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({data: data})
            }, SERVER_TIMEOUT_MS)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    if (result.success && result.image_base64) {
                        log.log('Visualization: Histogram generated successfully');
                        // Emit event to show visualization modal
                        // Pass the resolve callback so the modal can call it when closed
                        if (this.runtime) {
                            this.runtime.emit('VISUALIZATION_SHOW', {
                                imageData: result.image_base64,
                                onClose: resolve
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        log.warn(`Visualization error: ${result.error || 'Unknown error'}`);
                        resolve();
                    }
                })
                .catch(error => {
                    log.warn(`Visualization API error: ${error.message}`);
                    resolve();
                });
        });
    }
}

module.exports = Scratch3VisualizationBlocks;
