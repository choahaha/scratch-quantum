import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import sendIcon from './icon--send.svg';
import styles from './send-screen.css';

const SendScreenComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <img
            className={classNames(
                className,
                styles.sendScreen,
                {
                    [styles.isActive]: active
                }
            )}
            draggable={false}
            src={sendIcon}
            title={title}
            onClick={onClick}
            {...componentProps}
        />
    );
};

SendScreenComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};

SendScreenComponent.defaultProps = {
    active: false,
    title: 'Send Screen'
};

export default SendScreenComponent;
