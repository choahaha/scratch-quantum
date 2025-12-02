import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import GreenFlag from '../green-flag/green-flag.jsx';
import StopAll from '../stop-all/stop-all.jsx';
import TurboMode from '../turbo-mode/turbo-mode.jsx';
import SendScreen from '../send-screen/send-screen.jsx';

import styles from './controls.css';

const messages = defineMessages({
    goTitle: {
        id: 'gui.controls.go',
        defaultMessage: 'Go',
        description: 'Green flag button title'
    },
    stopTitle: {
        id: 'gui.controls.stop',
        defaultMessage: 'Stop',
        description: 'Stop button title'
    },
    sendTitle: {
        id: 'gui.controls.send',
        defaultMessage: 'Send Screen',
        description: 'Send screen button title'
    }
});

const Controls = function (props) {
    const {
        active,
        className,
        intl,
        isStudent,
        onGreenFlagClick,
        onStopAllClick,
        onSendScreenClick,
        sendActive,
        turbo,
        ...componentProps
    } = props;
    return (
        <div
            className={classNames(styles.controlsContainer, className)}
            {...componentProps}
        >
            <GreenFlag
                active={active}
                title={intl.formatMessage(messages.goTitle)}
                onClick={onGreenFlagClick}
            />
            <StopAll
                active={active}
                title={intl.formatMessage(messages.stopTitle)}
                onClick={onStopAllClick}
            />
            {isStudent && onSendScreenClick ? (
                <SendScreen
                    active={sendActive}
                    title={intl.formatMessage(messages.sendTitle)}
                    onClick={onSendScreenClick}
                />
            ) : null}
            {turbo ? (
                <TurboMode />
            ) : null}
        </div>
    );
};

Controls.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    intl: intlShape.isRequired,
    isStudent: PropTypes.bool,
    onGreenFlagClick: PropTypes.func.isRequired,
    onStopAllClick: PropTypes.func.isRequired,
    onSendScreenClick: PropTypes.func,
    sendActive: PropTypes.bool,
    turbo: PropTypes.bool
};

Controls.defaultProps = {
    active: false,
    isStudent: false,
    sendActive: false,
    turbo: false
};

export default injectIntl(Controls);
