/**
 * Blockly workspace to PNG converter
 * Captures blocks by inlining styles BEFORE cloning
 */

import computedStyleToInlineStyle from 'computed-style-to-inline-style';

/**
 * Convert a blob to data URI
 */
function blobToDataUri(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Convert all xlink:href images in SVG to data URIs
 */
async function convertImagesToDataUri(svg) {
    const images = svg.querySelectorAll('image');
    const promises = [];

    for (const img of images) {
        const href = img.getAttribute('xlink:href') || img.getAttribute('href');
        if (href && !href.startsWith('data:')) {
            const promise = fetch(href)
                .then(response => response.blob())
                .then(blob => blobToDataUri(blob))
                .then(dataUri => {
                    img.setAttribute('xlink:href', dataUri);
                    img.setAttribute('href', dataUri);
                })
                .catch(e => {
                    console.warn('Failed to convert image:', href, e);
                });
            promises.push(promise);
        }
    }

    await Promise.all(promises);
}

/**
 * Manually inline computed styles for all SVG elements
 */
function inlineAllStyles(element) {
    const allElements = element.querySelectorAll('*');
    const properties = [
        'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
        'color', 'font-family', 'font-size', 'font-weight', 'text-anchor',
        'opacity', 'fill-opacity', 'stroke-opacity',
        'dominant-baseline', 'alignment-baseline', 'display', 'visibility'
    ];

    allElements.forEach(el => {
        try {
            const computed = window.getComputedStyle(el);
            properties.forEach(prop => {
                const value = computed.getPropertyValue(prop);
                if (value && value !== 'none' && value !== '') {
                    el.style.setProperty(prop, value);
                }
            });
        } catch (e) {
            // Ignore elements that can't have computed style
        }
    });

    // Also process the root element
    try {
        const computed = window.getComputedStyle(element);
        properties.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== 'none' && value !== '') {
                element.style.setProperty(prop, value);
            }
        });
    } catch (e) {
        // Ignore
    }
}

/**
 * Convert SVG string to PNG blob
 */
function svgToPngBlob(svgString, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const scale = 2;
            const canvas = document.createElement('canvas');
            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            }, 'image/png');
        };

        img.onerror = (e) => {
            console.error('Image load error:', e);
            reject(new Error('Failed to load SVG as image'));
        };

        const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
        img.src = `data:image/svg+xml;base64,${svgBase64}`;
    });
}

/**
 * Capture the Blockly workspace as a PNG blob
 * @returns {Promise<Blob|null>} PNG blob or null if capture fails
 */
export async function captureBlocksAsImage() {
    const workspace = document.querySelector('.blocklySvg');
    if (!workspace) {
        console.warn('captureBlocksAsImage: Could not find .blocklySvg');
        return null;
    }

    const blockCanvas = workspace.querySelector('.blocklyBlockCanvas');
    if (!blockCanvas) {
        console.warn('captureBlocksAsImage: Could not find .blocklyBlockCanvas');
        return null;
    }

    const blocksBBox = blockCanvas.getBBox();
    if (blocksBBox.width === 0 || blocksBBox.height === 0) {
        console.warn('captureBlocksAsImage: No blocks to capture');
        return null;
    }

    const padding = 20;

    try {
        // IMPORTANT: Inline styles on the ORIGINAL elements while still in DOM context
        inlineAllStyles(blockCanvas);

        // Now clone after styles are inlined
        const blockCanvasClone = blockCanvas.cloneNode(true);

        // Also clone defs
        const defs = workspace.querySelector('defs');
        const defsClone = defs ? defs.cloneNode(true) : null;

        // Create new SVG
        const NS = 'http://www.w3.org/2000/svg';
        const newSvg = document.createElementNS(NS, 'svg');

        if (defsClone) {
            newSvg.appendChild(defsClone);
        }

        // Reset transform to position blocks at padding offset
        blockCanvasClone.setAttribute('transform', `translate(${padding - blocksBBox.x}, ${padding - blocksBBox.y})`);
        newSvg.appendChild(blockCanvasClone);

        const width = blocksBBox.width + (padding * 2);
        const height = blocksBBox.height + (padding * 2);

        newSvg.setAttribute('width', width);
        newSvg.setAttribute('height', height);
        newSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        newSvg.setAttribute('xmlns', NS);
        newSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

        // Convert images to data URIs
        await convertImagesToDataUri(newSvg);

        // Serialize
        const svgString = new XMLSerializer().serializeToString(newSvg);

        console.log('captureBlocksAsImage: Captured blocks', {width, height});

        return await svgToPngBlob(svgString, width, height);
    } catch (error) {
        console.error('captureBlocksAsImage error:', error);
        return null;
    }
}

export default captureBlocksAsImage;
