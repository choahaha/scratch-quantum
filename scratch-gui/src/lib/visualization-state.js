/**
 * Global state for visualization modal
 * Stores imageData, type and onClose callback that can't be stored in Redux
 */

let visualizationData = {
    imageData: null,
    type: null,
    onClose: null
};

export const setVisualizationData = (imageData, type, onClose) => {
    visualizationData = {imageData, type, onClose};
};

export const getVisualizationData = () => visualizationData;

export const clearVisualizationData = () => {
    visualizationData = {
        imageData: null,
        type: null,
        onClose: null
    };
};
