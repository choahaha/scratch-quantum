import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './visualization-modal.css';

const TITLES = {
    circuit: 'Quantum Circuit Diagram',
    histogram: 'Quantum Measurement Results'
};

const ALT_TEXT = {
    circuit: 'Quantum Circuit Diagram',
    histogram: 'Quantum Measurement Histogram'
};

const VisualizationModalComponent = ({imageData, type, onRequestClose}) => (
    <Modal
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
        contentLabel={TITLES[type] || TITLES.histogram}
        onRequestClose={onRequestClose}
        id="visualizationModal"
    >
        <div className={styles.body}>
            {imageData ? (
                <img
                    className={styles.histogramImage}
                    src={imageData}
                    alt={ALT_TEXT[type] || ALT_TEXT.histogram}
                />
            ) : (
                <div className={styles.loading}>Loading...</div>
            )}
        </div>
    </Modal>
);

VisualizationModalComponent.propTypes = {
    imageData: PropTypes.string,
    type: PropTypes.oneOf(['circuit', 'histogram']),
    onRequestClose: PropTypes.func.isRequired
};

export default VisualizationModalComponent;
