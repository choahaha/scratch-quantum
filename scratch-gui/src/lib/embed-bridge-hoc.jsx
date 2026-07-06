import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import {supabase} from './supabase-client.js';
import fetchProfile from './fetch-profile.js';
import {setUser} from '../reducers/auth.js';
import {getIsShowingProject} from '../reducers/project-state.js';

const BRIDGE_CHANNEL = 'scratch-quantum';
const BRIDGE_VERSION = 1;
const MAX_SHOTS_DETAIL = 100;

// Comma-separated allowed parent origins, baked in at build time
// (webpack DefinePlugin). Messages from any other origin are dropped.
const ALLOWED_ORIGINS = (process.env.MISSION_PLATFORM_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

/**
 * Bridge between the embedded editor (iframe) and the mission platform
 * (parent window). See the bridge protocol in the mission platform's
 * lib/embedBridge.js: MISSION_INIT / SUBMIT_REQUEST come in,
 * EMBED_READY / INIT_RESULT / QUANTUM_RUN_COMPLETED / SUBMIT_RESPONSE /
 * BRIDGE_ERROR go out.
 * @param {React.Component} WrappedComponent - component to wrap (the GUI)
 * @returns {React.Component} connected component with the bridge attached
 */
const EmbedBridgeHOC = function (WrappedComponent) {
    class EmbedBridgeComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleMessage',
                'handleQuantumRun'
            ]);
            // Fixed after the first valid MISSION_INIT; used as the exact
            // targetOrigin for every outgoing message that carries data.
            this.parentOrigin = null;
            this.pendingStarterProject = null;

            // Listen to the vm here rather than in componentDidMount:
            // the wrapped GUI uses the vm in its own componentDidMount,
            // which runs before this HOC's (same reason as vm-listener-hoc).
            this.props.vm.runtime.on('QUANTUM_RUN_COMPLETED', this.handleQuantumRun);
        }
        componentDidMount () {
            window.addEventListener('message', this.handleMessage);
            // EMBED_READY carries no data, so it may be announced to every
            // allowed origin before we know which one is the parent.
            ALLOWED_ORIGINS.forEach(origin => {
                this.postToParent({type: 'EMBED_READY'}, origin);
            });
        }
        componentDidUpdate (prevProps) {
            if (this.pendingStarterProject &&
                this.props.isShowingProject && !prevProps.isShowingProject) {
                this.loadStarterProject();
            }
        }
        componentWillUnmount () {
            window.removeEventListener('message', this.handleMessage);
            this.props.vm.runtime.removeListener('QUANTUM_RUN_COMPLETED', this.handleQuantumRun);
        }
        postToParent (message, origin) {
            const targetOrigin = origin || this.parentOrigin;
            if (!targetOrigin || window.parent === window) return;
            window.parent.postMessage({
                channel: BRIDGE_CHANNEL,
                version: BRIDGE_VERSION,
                ...message
            }, targetOrigin);
        }
        handleMessage (event) {
            if (event.source !== window.parent) return;
            if (!ALLOWED_ORIGINS.includes(event.origin)) return;
            const data = event.data;
            if (!data || data.channel !== BRIDGE_CHANNEL) return;

            switch (data.type) {
            case 'MISSION_INIT':
                this.parentOrigin = event.origin;
                this.handleMissionInit(data.payload || {});
                break;
            case 'SUBMIT_REQUEST':
                this.parentOrigin = this.parentOrigin || event.origin;
                this.handleSubmitRequest(data.requestId);
                break;
            default:
                break;
            }
        }
        async handleMissionInit ({accessToken, refreshToken, starterProject}) {
            try {
                if (accessToken && refreshToken) {
                    const {data, error} = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    });
                    if (error) throw error;
                    if (data.session && data.session.user) {
                        const user = data.session.user;
                        this.props.dispatchSetUser(user, null);
                        fetchProfile(user.id).then(profile => {
                            if (profile) this.props.dispatchSetUser(user, profile);
                        });
                    }
                }
                if (starterProject) {
                    this.pendingStarterProject = starterProject;
                    if (this.props.isShowingProject) {
                        await this.loadStarterProject();
                    }
                }
                this.postToParent({type: 'INIT_RESULT', payload: {ok: true}});
            } catch (error) {
                console.error('Embed bridge init error:', error);
                this.postToParent({
                    type: 'INIT_RESULT',
                    payload: {ok: false, error: error.message}
                });
            }
        }
        loadStarterProject () {
            const project = this.pendingStarterProject;
            this.pendingStarterProject = null;
            return this.props.vm.loadProject(JSON.stringify(project))
                .catch(error => {
                    console.error('Starter project load error:', error);
                    this.postToParent({
                        type: 'BRIDGE_ERROR',
                        payload: {message: `Starter project load failed: ${error.message}`}
                    });
                });
        }
        handleSubmitRequest (requestId) {
            const circuit = this.props.vm.runtime.quantumCircuit || {};
            this.postToParent({
                type: 'SUBMIT_RESPONSE',
                requestId: requestId,
                payload: {
                    blocks: circuit.blocks || [],
                    counts: circuit.counts || {},
                    projectJson: this.props.vm.toJSON()
                }
            });
        }
        handleQuantumRun (data) {
            this.postToParent({
                type: 'QUANTUM_RUN_COMPLETED',
                payload: {
                    blocks: data.blocks,
                    counts: data.counts,
                    shotsDetail: (data.shotsDetail || []).slice(0, MAX_SHOTS_DETAIL),
                    resultText: data.resultText
                }
            });
        }
        render () {
            const {
                /* eslint-disable no-unused-vars */
                dispatchSetUser,
                isShowingProject,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;
            return <WrappedComponent {...componentProps} />;
        }
    }

    EmbedBridgeComponent.propTypes = {
        dispatchSetUser: PropTypes.func.isRequired,
        isShowingProject: PropTypes.bool.isRequired,
        vm: PropTypes.shape({
            loadProject: PropTypes.func,
            toJSON: PropTypes.func,
            runtime: PropTypes.object
        }).isRequired
    };

    const mapStateToProps = state => ({
        vm: state.scratchGui.vm,
        isShowingProject: getIsShowingProject(state.scratchGui.projectState.loadingState)
    });

    const mapDispatchToProps = dispatch => ({
        dispatchSetUser: (user, profile) => dispatch(setUser(user, profile))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(EmbedBridgeComponent);
};

export default EmbedBridgeHOC;
