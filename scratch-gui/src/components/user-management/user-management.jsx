import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {defineMessages, injectIntl, intlShape, FormattedMessage} from 'react-intl';

import Modal from '../../containers/modal.jsx';
import styles from './user-management.css';

const messages = defineMessages({
    title: {
        id: 'gui.userManagement.title',
        defaultMessage: 'Class Management',
        description: 'Title for the class / user management modal'
    },
    searchPlaceholder: {
        id: 'gui.userManagement.searchPlaceholder',
        defaultMessage: 'Search by ID or name',
        description: 'Placeholder for the user search box'
    }
});

const ROLES = ['student', 'teacher', 'admin'];

const roleLabels = {
    student: {id: 'gui.userManagement.roleStudent', defaultMessage: 'Student'},
    teacher: {id: 'gui.userManagement.roleTeacher', defaultMessage: 'Teacher'},
    admin: {id: 'gui.userManagement.roleAdmin', defaultMessage: 'Admin'}
};

const UserManagementComponent = ({
    intl,
    isRtl,
    loading,
    error,
    users,
    savingId,
    currentUserId,
    onRequestClose,
    onRefresh,
    onChangeRole,
    onUpdateUser,
    onDeleteUser,
    onRenameClass,
    onDeleteClass
}) => {
    const [query, setQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');
    // Row currently being edited, plus its draft name/class values.
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editClass, setEditClass] = useState('');
    // Class manager panel (bulk rename / delete of whole classes).
    const [managingClasses, setManagingClasses] = useState(false);
    const [classDrafts, setClassDrafts] = useState({});

    // Distinct class names found on users, sorted (powers the filter + datalist).
    const classNames = useMemo(() => {
        const set = new Set();
        users.forEach(u => {
            if (u.class_name) set.add(u.class_name);
        });
        return Array.from(set).sort();
    }, [users]);

    // Keep the class-manager draft inputs in sync with the actual classes.
    useEffect(() => {
        if (!managingClasses) return;
        const drafts = {};
        classNames.forEach(name => {
            drafts[name] = name;
        });
        setClassDrafts(drafts);
    }, [classNames, managingClasses]);

    const memberCount = name => users.filter(u => u.class_name === name).length;

    const handleRenameClass = oldName => {
        const next = (classDrafts[oldName] || '').trim();
        if (!next || next === oldName) return;
        onRenameClass(oldName, next);
    };

    const handleDeleteClass = name => {
        // eslint-disable-next-line no-alert
        if (!window.confirm(intl.formatMessage(
            {
                id: 'gui.userManagement.confirmDeleteClass',
                defaultMessage: 'Remove class "{name}"? Its {count} member(s) will be unassigned.'
            },
            {name, count: memberCount(name)}
        ))) {
            return;
        }
        onDeleteClass(name);
    };

    const startEdit = user => {
        setEditingId(user.id);
        setEditName(user.display_name || '');
        setEditClass(user.class_name || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditClass('');
    };

    const saveEdit = userId => {
        Promise.resolve(onUpdateUser(userId, {
            display_name: editName,
            class_name: editClass
        })).then(ok => {
            if (ok !== false) cancelEdit();
        });
    };

    const handleDelete = user => {
        // eslint-disable-next-line no-alert
        if (!window.confirm(intl.formatMessage(
            {
                id: 'gui.userManagement.confirmDelete',
                defaultMessage: 'Delete account "{name}" and all of its data? This cannot be undone.'
            },
            {name: user.username}
        ))) {
            return;
        }
        onDeleteUser(user.id);
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users.filter(u => {
            if (classFilter && (u.class_name || '') !== classFilter) return false;
            if (!q) return true;
            return (
                (u.username || '').toLowerCase().includes(q) ||
                (u.display_name || '').toLowerCase().includes(q)
            );
        });
    }, [users, query, classFilter]);

    const roleCount = role => users.filter(u => u.role === role).length;

    return (
        <Modal
            fullScreen
            id="userManagementModal"
            contentLabel={intl.formatMessage(messages.title)}
            headerClassName={styles.modalHeader}
            isRtl={isRtl}
            onRequestClose={onRequestClose}
        >
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.stats}>
                        <span className={styles.statTotal}>
                            <FormattedMessage
                                defaultMessage="{count} members"
                                description="Total number of registered users"
                                id="gui.userManagement.total"
                                values={{count: users.length}}
                            />
                        </span>
                        <span className={styles.statPill}>
                            {`${intl.formatMessage(roleLabels.student)} ${roleCount('student')}`}
                        </span>
                        <span className={styles.statPill}>
                            {`${intl.formatMessage(roleLabels.teacher)} ${roleCount('teacher')}`}
                        </span>
                        <span className={styles.statPill}>
                            {`${intl.formatMessage(roleLabels.admin)} ${roleCount('admin')}`}
                        </span>
                    </div>
                    <div className={styles.controls}>
                        <input
                            className={styles.search}
                            type="text"
                            value={query}
                            placeholder={intl.formatMessage(messages.searchPlaceholder)}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <select
                            className={styles.classFilter}
                            value={classFilter}
                            onChange={e => setClassFilter(e.target.value)}
                        >
                            <option value="">
                                {intl.formatMessage({
                                    id: 'gui.userManagement.allClasses',
                                    defaultMessage: 'All classes'
                                })}
                            </option>
                            {classNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <span className={styles.toolbarSpacer} />
                        <button
                            className={styles.refreshButton}
                            onClick={() => setManagingClasses(true)}
                        >
                            <FormattedMessage
                                defaultMessage="Manage classes"
                                description="Button to open the class manager (rename/delete classes)"
                                id="gui.userManagement.manageClasses"
                            />
                        </button>
                        <button
                            className={styles.refreshButton}
                            onClick={onRefresh}
                        >
                            <FormattedMessage
                                defaultMessage="Refresh"
                                description="Button to refresh the user list"
                                id="gui.userManagement.refresh"
                            />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div className={styles.loading}>
                            <FormattedMessage
                                defaultMessage="Loading..."
                                description="Loading message"
                                id="gui.userManagement.loading"
                            />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <FormattedMessage
                                defaultMessage="No members found"
                                description="Empty state for user management"
                                id="gui.userManagement.empty"
                            />
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>
                                        <FormattedMessage
                                            defaultMessage="ID"
                                            description="Username column header"
                                            id="gui.userManagement.colId"
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            defaultMessage="Name"
                                            description="Display name column header"
                                            id="gui.userManagement.colName"
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            defaultMessage="Role"
                                            description="Role column header"
                                            id="gui.userManagement.colRole"
                                        />
                                    </th>
                                    <th>
                                        <FormattedMessage
                                            defaultMessage="Class"
                                            description="Class column header"
                                            id="gui.userManagement.colClass"
                                        />
                                    </th>
                                    <th className={styles.actionsHead}>
                                        <FormattedMessage
                                            defaultMessage="Actions"
                                            description="Row actions column header"
                                            id="gui.userManagement.colActions"
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => {
                                    const isSelf = user.id === currentUserId;
                                    const initial = (user.username || '?').charAt(0).toUpperCase();
                                    const role = user.role || 'student';
                                    const isEditing = editingId === user.id;
                                    return (
                                        <tr
                                            key={user.id}
                                            className={savingId === user.id ? styles.saving : ''}
                                        >
                                            <td>
                                                <div className={styles.idCell}>
                                                    <span className={styles.avatar}>{initial}</span>
                                                    <span className={styles.username}>{user.username}</span>
                                                    {isSelf && (
                                                        <span className={styles.selfBadge}>
                                                            <FormattedMessage
                                                                defaultMessage="me"
                                                                description="Badge marking the current admin's own row"
                                                                id="gui.userManagement.selfBadge"
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={styles.nameCell}>
                                                {isEditing ? (
                                                    <input
                                                        autoFocus
                                                        className={styles.editInput}
                                                        type="text"
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') saveEdit(user.id);
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                    />
                                                ) : user.display_name}
                                            </td>
                                            <td>
                                                <span className={styles.dotWrap}>
                                                    <span className={`${styles.dot} ${styles[`dot_${role}`]}`} />
                                                    <select
                                                        className={styles.roleSelect}
                                                        value={role}
                                                        disabled={isSelf}
                                                        title={isSelf ? intl.formatMessage({
                                                            id: 'gui.userManagement.cannotChangeSelf',
                                                            defaultMessage: 'You cannot change your own role'
                                                        }) : ''}
                                                        onChange={e => onChangeRole(user.id, e.target.value)}
                                                    >
                                                        {ROLES.map(r => (
                                                            <option key={r} value={r}>
                                                                {intl.formatMessage(roleLabels[r])}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </span>
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        className={styles.editInput}
                                                        type="text"
                                                        list="user-management-classes"
                                                        value={editClass}
                                                        placeholder={intl.formatMessage({
                                                            id: 'gui.userManagement.classPlaceholder',
                                                            defaultMessage: 'Class name'
                                                        })}
                                                        onChange={e => setEditClass(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') saveEdit(user.id);
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                    />
                                                ) : (
                                                    <span className={user.class_name ? '' : styles.classEmpty}>
                                                        {user.class_name || '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className={styles.actionsCell}>
                                                {isEditing ? (
                                                    <React.Fragment>
                                                        <button
                                                            className={styles.saveButton}
                                                            onClick={() => saveEdit(user.id)}
                                                        >
                                                            <FormattedMessage
                                                                defaultMessage="Save"
                                                                description="Save edited member"
                                                                id="gui.userManagement.save"
                                                            />
                                                        </button>
                                                        <button
                                                            className={styles.iconButton}
                                                            title={intl.formatMessage({
                                                                id: 'gui.userManagement.cancel',
                                                                defaultMessage: 'Cancel'
                                                            })}
                                                            onClick={cancelEdit}
                                                        >
                                                            {'✕'}
                                                        </button>
                                                    </React.Fragment>
                                                ) : (
                                                    <React.Fragment>
                                                        <button
                                                            className={styles.iconButton}
                                                            title={intl.formatMessage({
                                                                id: 'gui.userManagement.edit',
                                                                defaultMessage: 'Edit'
                                                            })}
                                                            onClick={() => startEdit(user)}
                                                        >
                                                            {'✏️'}
                                                        </button>
                                                        <button
                                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                                            disabled={isSelf}
                                                            title={isSelf ? intl.formatMessage({
                                                                id: 'gui.userManagement.cannotDeleteSelf',
                                                                defaultMessage: 'You cannot delete your own account'
                                                            }) : intl.formatMessage({
                                                                id: 'gui.userManagement.delete',
                                                                defaultMessage: 'Delete account'
                                                            })}
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            {'✕'}
                                                        </button>
                                                    </React.Fragment>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                    <datalist id="user-management-classes">
                        {classNames.map(name => (
                            <option key={name} value={name} />
                        ))}
                    </datalist>
                </div>

                {managingClasses && (
                    <div
                        className={styles.managerOverlay}
                        onClick={() => setManagingClasses(false)}
                    >
                        <div
                            className={styles.managerPanel}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className={styles.managerHeader}>
                                <span className={styles.managerTitle}>
                                    <FormattedMessage
                                        defaultMessage="Manage classes"
                                        description="Title of the class manager panel"
                                        id="gui.userManagement.manageClassesTitle"
                                    />
                                </span>
                                <button
                                    className={styles.iconButton}
                                    onClick={() => setManagingClasses(false)}
                                >
                                    {'✕'}
                                </button>
                            </div>
                            <div className={styles.managerBody}>
                                {classNames.length === 0 ? (
                                    <p className={styles.managerEmpty}>
                                        <FormattedMessage
                                            defaultMessage="No classes yet. Assign a class to a member first."
                                            description="Empty state for the class manager"
                                            id="gui.userManagement.noClasses"
                                        />
                                    </p>
                                ) : classNames.map(name => (
                                    <div
                                        key={name}
                                        className={styles.classRow}
                                    >
                                        <input
                                            className={styles.editInput}
                                            type="text"
                                            value={classDrafts[name] || ''}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setClassDrafts(prev => ({
                                                    ...prev,
                                                    [name]: value
                                                }));
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleRenameClass(name);
                                            }}
                                        />
                                        <span className={styles.classCount}>
                                            <FormattedMessage
                                                defaultMessage="{count} member(s)"
                                                description="Member count for a class"
                                                id="gui.userManagement.classMemberCount"
                                                values={{count: memberCount(name)}}
                                            />
                                        </span>
                                        <button
                                            className={styles.saveButton}
                                            disabled={!classDrafts[name] ||
                                                classDrafts[name].trim() === name ||
                                                classDrafts[name].trim() === ''}
                                            onClick={() => handleRenameClass(name)}
                                        >
                                            <FormattedMessage
                                                defaultMessage="Rename"
                                                description="Rename a class"
                                                id="gui.userManagement.rename"
                                            />
                                        </button>
                                        <button
                                            className={`${styles.iconButton} ${styles.deleteButton}`}
                                            title={intl.formatMessage({
                                                id: 'gui.userManagement.deleteClass',
                                                defaultMessage: 'Delete class'
                                            })}
                                            onClick={() => handleDeleteClass(name)}
                                        >
                                            {'✕'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

UserManagementComponent.propTypes = {
    currentUserId: PropTypes.string,
    error: PropTypes.string,
    intl: intlShape.isRequired,
    isRtl: PropTypes.bool,
    loading: PropTypes.bool,
    onChangeRole: PropTypes.func.isRequired,
    onDeleteClass: PropTypes.func.isRequired,
    onDeleteUser: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onRenameClass: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
    onUpdateUser: PropTypes.func.isRequired,
    savingId: PropTypes.string,
    users: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        username: PropTypes.string,
        display_name: PropTypes.string,
        role: PropTypes.string,
        class_name: PropTypes.string
    }))
};

UserManagementComponent.defaultProps = {
    loading: false,
    users: []
};

export default injectIntl(UserManagementComponent);
