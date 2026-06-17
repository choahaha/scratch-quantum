import PropTypes from 'prop-types';
import React, {useMemo, useState} from 'react';
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
    onChangeClass
}) => {
    const [query, setQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');
    // Classes created in this session that have no members assigned yet.
    const [extraClasses, setExtraClasses] = useState([]);
    const [addingClass, setAddingClass] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    // Row id currently typing a brand-new class via the "+ New" dropdown option.
    const [inlineClassRow, setInlineClassRow] = useState(null);
    const [inlineClassValue, setInlineClassValue] = useState('');

    // Union of class names found on users plus any added this session, sorted.
    const classNames = useMemo(() => {
        const set = new Set(extraClasses);
        users.forEach(u => {
            if (u.class_name) set.add(u.class_name);
        });
        return Array.from(set).sort();
    }, [users, extraClasses]);

    const addClass = name => {
        const trimmed = name.trim();
        if (!trimmed) return;
        if (!classNames.includes(trimmed)) {
            setExtraClasses(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
        }
        return trimmed;
    };

    const handleAddClassConfirm = () => {
        addClass(newClassName);
        setNewClassName('');
        setAddingClass(false);
    };

    const handleRowClassChange = (user, value) => {
        if (value === '__add__') {
            setInlineClassRow(user.id);
            setInlineClassValue('');
            return;
        }
        onChangeClass(user.id, value);
    };

    const handleInlineClassConfirm = userId => {
        const name = addClass(inlineClassValue);
        if (name) onChangeClass(userId, name);
        setInlineClassRow(null);
        setInlineClassValue('');
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
                        {addingClass ? (
                            <span className={styles.addClassBox}>
                                <input
                                    autoFocus
                                    className={styles.addClassInput}
                                    type="text"
                                    value={newClassName}
                                    placeholder={intl.formatMessage({
                                        id: 'gui.userManagement.newClassPlaceholder',
                                        defaultMessage: 'New class name'
                                    })}
                                    onChange={e => setNewClassName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleAddClassConfirm();
                                        if (e.key === 'Escape') {
                                            setAddingClass(false);
                                            setNewClassName('');
                                        }
                                    }}
                                />
                                <button
                                    className={styles.addClassConfirm}
                                    onClick={handleAddClassConfirm}
                                >
                                    <FormattedMessage
                                        defaultMessage="Add"
                                        description="Confirm adding a new class"
                                        id="gui.userManagement.addClassConfirm"
                                    />
                                </button>
                                <button
                                    className={styles.addClassCancel}
                                    onClick={() => {
                                        setAddingClass(false);
                                        setNewClassName('');
                                    }}
                                >
                                    {'✕'}
                                </button>
                            </span>
                        ) : (
                            <button
                                className={styles.addClassButton}
                                onClick={() => setAddingClass(true)}
                            >
                                <FormattedMessage
                                    defaultMessage="+ Add class"
                                    description="Button to create a new class"
                                    id="gui.userManagement.addClass"
                                />
                            </button>
                        )}
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
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => {
                                    const isSelf = user.id === currentUserId;
                                    const initial = (user.username || '?').charAt(0).toUpperCase();
                                    const role = user.role || 'student';
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
                                            <td className={styles.nameCell}>{user.display_name}</td>
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
                                                {inlineClassRow === user.id ? (
                                                    <span className={styles.addClassBox}>
                                                        <input
                                                            autoFocus
                                                            className={styles.classInput}
                                                            type="text"
                                                            value={inlineClassValue}
                                                            placeholder={intl.formatMessage({
                                                                id: 'gui.userManagement.newClassPlaceholder',
                                                                defaultMessage: 'New class name'
                                                            })}
                                                            onChange={e => setInlineClassValue(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') handleInlineClassConfirm(user.id);
                                                                if (e.key === 'Escape') setInlineClassRow(null);
                                                            }}
                                                        />
                                                        <button
                                                            className={styles.addClassConfirm}
                                                            onClick={() => handleInlineClassConfirm(user.id)}
                                                        >
                                                            <FormattedMessage
                                                                defaultMessage="Add"
                                                                description="Confirm adding a new class"
                                                                id="gui.userManagement.addClassConfirm"
                                                            />
                                                        </button>
                                                        <button
                                                            className={styles.addClassCancel}
                                                            onClick={() => setInlineClassRow(null)}
                                                        >
                                                            {'✕'}
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <select
                                                        className={styles.classSelect}
                                                        value={user.class_name || ''}
                                                        onChange={e => handleRowClassChange(user, e.target.value)}
                                                    >
                                                        <option value="">{'-'}</option>
                                                        {classNames.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                        <option value="__add__">
                                                            {intl.formatMessage({
                                                                id: 'gui.userManagement.newClassOption',
                                                                defaultMessage: '+ New class…'
                                                            })}
                                                        </option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
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
    onChangeClass: PropTypes.func.isRequired,
    onChangeRole: PropTypes.func.isRequired,
    onRefresh: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func.isRequired,
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
