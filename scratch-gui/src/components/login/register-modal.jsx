import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import styles from './register-modal.css';

class RegisterModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUsernameChange',
            'handleDisplayNameChange',
            'handlePasswordChange',
            'handleConfirmPasswordChange',
            'handleSubmit',
            'handleClose'
        ]);
        this.state = {
            username: '',
            displayName: '',
            password: '',
            confirmPassword: '',
            isSubmitting: false,
            error: null
        };
    }

    handleUsernameChange (e) {
        this.setState({username: e.target.value, error: null});
    }

    handleDisplayNameChange (e) {
        this.setState({displayName: e.target.value, error: null});
    }

    handlePasswordChange (e) {
        this.setState({password: e.target.value, error: null});
    }

    handleConfirmPasswordChange (e) {
        this.setState({confirmPassword: e.target.value, error: null});
    }

    handleSubmit (e) {
        e.preventDefault();
        const {username, displayName, password, confirmPassword} = this.state;

        if (!username || !displayName || !password || !confirmPassword) {
            this.setState({error: 'Please fill in all fields.'});
            return;
        }

        if (password !== confirmPassword) {
            this.setState({error: 'Passwords do not match.'});
            return;
        }

        if (password.length < 6) {
            this.setState({error: 'Password must be at least 6 characters.'});
            return;
        }

        this.setState({isSubmitting: true, error: null});
        this.props.onRegister(username, displayName, password)
            .then(() => {
                this.props.onClose();
            })
            .catch(err => {
                this.setState({
                    error: err.message || 'Sign-up failed.',
                    isSubmitting: false
                });
            });
    }

    handleClose () {
        this.props.onClose();
    }

    render () {
        const {username, displayName, password, confirmPassword, isSubmitting, error} = this.state;

        return (
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <div className={styles.header}>
                        <h2 className={styles.headerTitle}>Sign up</h2>
                        <button
                            className={styles.closeButton}
                            onClick={this.handleClose}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>

                    <form
                        className={styles.form}
                        onSubmit={this.handleSubmit}
                    >
                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-username"
                            >
                                Username
                            </label>
                            <input
                                className={styles.input}
                                id="reg-username"
                                type="text"
                                value={username}
                                onChange={this.handleUsernameChange}
                                placeholder="Enter your username"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-displayname"
                            >
                                Name
                            </label>
                            <input
                                className={styles.input}
                                id="reg-displayname"
                                type="text"
                                value={displayName}
                                onChange={this.handleDisplayNameChange}
                                placeholder="Enter your name"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-password"
                            >
                                Password
                            </label>
                            <input
                                className={styles.input}
                                id="reg-password"
                                type="password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                placeholder="Enter your password"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-confirm"
                            >
                                Confirm password
                            </label>
                            <input
                                className={styles.input}
                                id="reg-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={this.handleConfirmPasswordChange}
                                placeholder="Re-enter your password"
                                disabled={isSubmitting}
                            />
                        </div>

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing up...' : 'Sign up'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}

RegisterModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onRegister: PropTypes.func.isRequired
};

export default RegisterModal;
