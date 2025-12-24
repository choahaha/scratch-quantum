import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import VisualizationModalComponent from '../components/visualization-modal/visualization-modal.jsx';
import {closeVisualizationModal} from '../reducers/modals';
import {getVisualizationData, clearVisualizationData} from '../lib/visualization-state';

class VisualizationModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleRequestClose'
        ]);
    }

    handleRequestClose () {
        // Get the callback from global state and call it
        const {onClose} = getVisualizationData();
        if (onClose) {
            onClose();
        }
        // Clear the global state
        clearVisualizationData();
        // Close the modal
        this.props.onRequestClose();
    }

    render () {
        const {imageData} = getVisualizationData();
        return (
            <VisualizationModalComponent
                imageData={imageData}
                onRequestClose={this.handleRequestClose}
            />
        );
    }
}

VisualizationModal.propTypes = {
    onRequestClose: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    onRequestClose: () => dispatch(closeVisualizationModal())
});

export default connect(
    null,
    mapDispatchToProps
)(VisualizationModal);
