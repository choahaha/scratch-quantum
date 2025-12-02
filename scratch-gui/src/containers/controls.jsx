import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';
import {supabase} from '../lib/supabase-client.js';
import dataURItoBlob from '../lib/data-uri-to-blob.js';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick',
            'handleSendScreenClick'
        ]);
        this.state = {
            sendActive: false
        };
    }
    handleGreenFlagClick (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            if (!this.props.isStarted) {
                this.props.vm.start();
            }
            this.props.vm.greenFlag();
        }
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    handleSendScreenClick (e) {
        e.preventDefault();
        if (this.state.sendActive) return;

        this.setState({sendActive: true});

        const vm = this.props.vm;
        const userId = this.props.userId;
        const username = this.props.username;

        if (!vm.renderer || !userId) {
            this.setState({sendActive: false});
            return;
        }

        vm.renderer.requestSnapshot(async dataURI => {
            try {
                const blob = dataURItoBlob(dataURI);
                const timestamp = Date.now();
                const filePath = `${userId}/${timestamp}.png`;

                const {error: uploadError} = await supabase.storage
                    .from('screenshots')
                    .upload(filePath, blob, {
                        contentType: 'image/png',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Screenshot upload error:', uploadError);
                    this.setState({sendActive: false});
                    return;
                }

                const {data: urlData} = supabase.storage
                    .from('screenshots')
                    .getPublicUrl(filePath);

                await supabase.from('student_screens').insert({
                    user_id: userId,
                    username: username,
                    screenshot_url: urlData.publicUrl
                });

                this.setState({sendActive: false});
            } catch (error) {
                console.error('Send screen error:', error);
                this.setState({sendActive: false});
            }
        });
        vm.renderer.draw();
    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            isStudent,
            userId, // eslint-disable-line no-unused-vars
            username, // eslint-disable-line no-unused-vars
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                active={projectRunning}
                turbo={turbo}
                isStudent={isStudent}
                sendActive={this.state.sendActive}
                onGreenFlagClick={this.handleGreenFlagClick}
                onStopAllClick={this.handleStopAllClick}
                onSendScreenClick={isStudent ? this.handleSendScreenClick : null}
            />
        );
    }
}

Controls.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    isStudent: PropTypes.bool,
    projectRunning: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    username: PropTypes.string,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => {
    const profile = state.scratchGui.auth.profile;
    return {
        isStarted: state.scratchGui.vmStatus.running,
        projectRunning: state.scratchGui.vmStatus.running,
        turbo: state.scratchGui.vmStatus.turbo,
        isStudent: !!profile && profile.role !== 'admin',
        userId: profile ? profile.id : null,
        username: profile ? profile.username : null
    };
};
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
