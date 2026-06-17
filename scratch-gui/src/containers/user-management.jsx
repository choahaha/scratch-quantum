import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import UserManagementComponent from '../components/user-management/user-management.jsx';
import {closeUserManagement} from '../reducers/modals';
import {supabase} from '../lib/supabase-client.js';

class UserManagement extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
            'handleRefresh',
            'fetchUsers',
            'handleChangeRole',
            'handleChangeClass'
        ]);
        this.state = {
            loading: true,
            error: null,
            users: [],
            savingId: null
        };
    }

    componentDidMount () {
        this.fetchUsers();
    }

    async fetchUsers () {
        this.setState({loading: true, error: null});
        try {
            const {data, error} = await supabase
                .from('users')
                .select('*')
                .order('username', {ascending: true});

            if (error) {
                console.error('Error fetching users:', error);
                this.setState({loading: false, error: error.message});
                return;
            }

            this.setState({users: data || [], loading: false});
        } catch (error) {
            console.error('Error fetching users:', error);
            this.setState({loading: false, error: error.message});
        }
    }

    // Optimistically update a single user row in local state
    patchUser (userId, patch) {
        this.setState(prevState => ({
            users: prevState.users.map(u => (u.id === userId ? {...u, ...patch} : u))
        }));
    }

    async handleChangeRole (userId, role) {
        const prev = this.state.users.find(u => u.id === userId);
        const prevRole = prev ? prev.role : null;
        this.patchUser(userId, {role});
        this.setState({savingId: userId, error: null});

        const {data, error} = await supabase
            .from('users')
            .update({role})
            .eq('id', userId)
            .select();

        if (error || !data || data.length === 0) {
            // revert on failure
            this.patchUser(userId, {role: prevRole});
            const message = error ?
                error.message :
                'Update failed: you may not have permission (check the admin RLS policy).';
            console.error('Error updating role:', error);
            this.setState({savingId: null, error: message});
            return;
        }
        this.setState({savingId: null});
    }

    async handleChangeClass (userId, className) {
        const prev = this.state.users.find(u => u.id === userId);
        const prevClass = prev ? prev.class_name : null;
        const value = className.trim() === '' ? null : className.trim();
        this.patchUser(userId, {class_name: value});
        this.setState({savingId: userId, error: null});

        const {data, error} = await supabase
            .from('users')
            .update({class_name: value})
            .eq('id', userId)
            .select();

        if (error || !data || data.length === 0) {
            this.patchUser(userId, {class_name: prevClass});
            const message = error ?
                error.message :
                'Update failed: you may not have permission (check the admin RLS policy).';
            console.error('Error updating class:', error);
            this.setState({savingId: null, error: message});
            return;
        }
        this.setState({savingId: null});
    }

    handleClose () {
        this.props.onClose();
    }

    handleRefresh () {
        this.fetchUsers();
    }

    render () {
        return (
            <UserManagementComponent
                currentUserId={this.props.currentUserId}
                error={this.state.error}
                isRtl={this.props.isRtl}
                loading={this.state.loading}
                savingId={this.state.savingId}
                users={this.state.users}
                onChangeClass={this.handleChangeClass}
                onChangeRole={this.handleChangeRole}
                onRefresh={this.handleRefresh}
                onRequestClose={this.handleClose}
            />
        );
    }
}

UserManagement.propTypes = {
    currentUserId: PropTypes.string,
    isRtl: PropTypes.bool,
    onClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    currentUserId: state.scratchGui.auth.profile ? state.scratchGui.auth.profile.id : null
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeUserManagement())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserManagement);
