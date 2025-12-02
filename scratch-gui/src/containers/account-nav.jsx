/*
NOTE: this file only temporarily resides in scratch-gui.
Nearly identical code appears in scratch-www, and the two should
eventually be consolidated.
*/

import {injectIntl} from 'react-intl';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import AccountNavComponent from '../components/menu-bar/account-nav.jsx';

const AccountNav = function (props) {
    const {
        ...componentProps
    } = props;
    return (
        <AccountNavComponent
            {...componentProps}
        />
    );
};

AccountNav.propTypes = {
    isAdmin: PropTypes.bool,
    isRtl: PropTypes.bool,
    thumbnailUrl: PropTypes.string,
    username: PropTypes.string
};

const mapStateToProps = state => ({
    isAdmin: state.scratchGui.auth.profile && state.scratchGui.auth.profile.role === 'admin',
    thumbnailUrl: state.scratchGui.auth.profile ? state.scratchGui.auth.profile.avatar_url : null,
    username: state.scratchGui.auth.profile ? state.scratchGui.auth.profile.username : ''
});

const mapDispatchToProps = () => ({});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(AccountNav));
