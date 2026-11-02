/**
 * Library assets bundled with Scratch Quantum instead of hosted on the Scratch CDN.
 * Files live in static/quantum-assets/ and are named by the MD5 of their content,
 * like every other Scratch asset, so projects that use them save and load normally.
 */
const LOCAL_ASSETS = [
    // Qubit1 sprite (Qubit1_1 ... Qubit1_6)
    'd3e828697fd4339cf404d8ff755925a0.png',
    'fc88e38b3f1ee02d7b65f34b5176b154.png',
    '1379658c9b4bd4de381ed893ae75816f.png',
    'e532dcf3ed7d0e54821f0c47e1186312.png',
    '39fc6371830f1827eef4467f757f66ae.png',
    '6ee0c10bc04751aeecddf36651e05118.png'
];

/**
 * @param {string} md5ext - asset file name, e.g. "d3e8...a0.png"
 * @returns {?string} relative URL of the bundled file, or null if the asset is not bundled
 */
const getLocalAssetURL = md5ext => (
    LOCAL_ASSETS.includes(md5ext) ? `static/quantum-assets/${md5ext}` : null
);

export default getLocalAssetURL;
