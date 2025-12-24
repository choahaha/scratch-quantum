/**
 * Global state for visualization modal
 * Stores imageData and onClose callback that can't be stored in Redux
 */

let visualizationData = {
    imageData: null,
    onClose: null
};

export const setVisualizationData = (imageData, onClose) => {
    visualizationData = {imageData, onClose};
};

export const getVisualizationData = () => visualizationData;

export const clearVisualizationData = () => {
    visualizationData = {
        imageData: null,
        onClose: null
    };
};
