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
            'handleUpdateUser',
            'handleDeleteUser',
            'handleRenameClass',
            'handleDeleteClass'
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

    // Update display name and/or class. Returns true on success so the
    // component can leave edit mode only when the save actually persisted.
    async handleUpdateUser (userId, patch) {
        const prev = this.state.users.find(u => u.id === userId);
        const update = {};
        if (typeof patch.display_name !== 'undefined') {
            const name = patch.display_name.trim();
            // Keep the previous display name rather than writing an empty one.
            update.display_name = name === '' ? (prev ? prev.display_name : null) : name;
        }
        if (typeof patch.class_name !== 'undefined') {
            const cls = patch.class_name.trim();
            update.class_name = cls === '' ? null : cls;
        }

        this.patchUser(userId, update);
        this.setState({savingId: userId, error: null});

        const {data, error} = await supabase
            .from('users')
            .update(update)
            .eq('id', userId)
            .select();

        if (error || !data || data.length === 0) {
            // revert to the previous values
            if (prev) {
                this.patchUser(userId, {
                    display_name: prev.display_name,
                    class_name: prev.class_name
                });
            }
            const message = error ?
                error.message :
                'Update failed: you may not have permission (check the admin RLS policy).';
            console.error('Error updating user:', error);
            this.setState({savingId: null, error: message});
            return false;
        }
        this.setState({savingId: null});
        return true;
    }

    async handleDeleteUser (userId) {
        this.setState({savingId: userId, error: null});
        try {
            // Remove the student's saved work first (avoids FK violations).
            await supabase
                .from('student_screens')
                .delete()
                .eq('user_id', userId);
            await supabase
                .from('student_visualizations')
                .delete()
                .eq('user_id', userId);

            const {data, error} = await supabase
                .from('users')
                .delete()
                .eq('id', userId)
                .select();

            if (error || !data || data.length === 0) {
                const message = error ?
                    error.message :
                    'Delete failed: you may not have permission (check the admin RLS policy).';
                console.error('Error deleting user:', error);
                this.setState({savingId: null, error: message});
                return;
            }

            this.setState(prevState => ({
                users: prevState.users.filter(u => u.id !== userId),
                savingId: null
            }));
        } catch (err) {
            console.error('Error deleting user:', err);
            this.setState({savingId: null, error: err.message});
        }
    }

    // Bulk-rename a class: every member of oldName moves to newName.
    async handleRenameClass (oldName, newName) {
        this.setState({error: null});
        const {data, error} = await supabase
            .from('users')
            .update({class_name: newName})
            .eq('class_name', oldName)
            .select();

        if (error || !data) {
            const message = error ?
                error.message :
                'Rename failed: you may not have permission (check the admin RLS policy).';
            console.error('Error renaming class:', error);
            this.setState({error: message});
            return;
        }

        this.setState(prevState => ({
            users: prevState.users.map(u => (
                u.class_name === oldName ? {...u, class_name: newName} : u
            ))
        }));
    }

    // Delete a class by unassigning all of its members (class_name -> null).
    async handleDeleteClass (name) {
        this.setState({error: null});
        const {data, error} = await supabase
            .from('users')
            .update({class_name: null})
            .eq('class_name', name)
            .select();

        if (error || !data) {
            const message = error ?
                error.message :
                'Delete failed: you may not have permission (check the admin RLS policy).';
            console.error('Error deleting class:', error);
            this.setState({error: message});
            return;
        }

        this.setState(prevState => ({
            users: prevState.users.map(u => (
                u.class_name === name ? {...u, class_name: null} : u
            ))
        }));
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
                onChangeRole={this.handleChangeRole}
                onDeleteClass={this.handleDeleteClass}
                onDeleteUser={this.handleDeleteUser}
                onRefresh={this.handleRefresh}
                onRenameClass={this.handleRenameClass}
                onRequestClose={this.handleClose}
                onUpdateUser={this.handleUpdateUser}
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
