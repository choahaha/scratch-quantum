import PropTypes from 'prop-types';
import React from 'react';
import Modal from '../../containers/modal.jsx';
import styles from './visualization-modal.css';

const VisualizationModalComponent = ({imageData, onRequestClose}) => (
    <Modal
        className={styles.modalContent}
        contentLabel="Quantum Measurement Results"
        onRequestClose={onRequestClose}
        id="visualizationModal"
    >
        <div className={styles.body}>
            {imageData ? (
                <img
                    className={styles.histogramImage}
                    src={imageData}
                    alt="Quantum Measurement Histogram"
                />
            ) : (
                <div className={styles.loading}>Loading...</div>
            )}
        </div>
    </Modal>
);

VisualizationModalComponent.propTypes = {
    imageData: PropTypes.string,
    onRequestClose: PropTypes.func.isRequired
};

export default VisualizationModalComponent;
