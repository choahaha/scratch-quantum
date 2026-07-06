// Embedded editor entry for the mission platform.
// Full editor without the menu bar or login gate: authentication and the
// starter project arrive from the parent window via the postMessage
// bridge (EmbedBridgeHOC). Deliberately no AuthManagerHOC, no
// HashParserHOC and no onbeforeunload handler — the parent platform owns
// navigation and the session.
import React from 'react';
import ReactDOM from 'react-dom';
import {compose} from 'redux';

import GUI from '../containers/gui.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';
import EmbedBridgeHOC from '../lib/embed-bridge-hoc.jsx';

import styles from './embed.css';

const WrappedGui = compose(
    AppStateHOC,
    EmbedBridgeHOC
)(GUI);

const appTarget = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

ReactDOM.render(
    <WrappedGui
        isEmbedded
        canEditTitle={false}
        canSave={false}
        projectId="0"
    />,
    appTarget
);
