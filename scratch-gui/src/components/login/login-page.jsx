import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import styles from './login-page.css';

class LoginPage extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleUsernameChange',
            'handlePasswordChange',
            'handleSubmit',
            'handleRegisterClick'
        ]);
        this.state = {
            username: '',
            password: '',
            isSubmitting: false,
            error: null
        };
    }

    handleUsernameChange (e) {
        this.setState({username: e.target.value, error: null});
    }

    handlePasswordChange (e) {
        this.setState({password: e.target.value, error: null});
    }

    handleSubmit (e) {
        e.preventDefault();
        const {username, password} = this.state;

        if (!username || !password) {
            this.setState({error: 'Please enter your username and password.'});
            return;
        }

        this.setState({isSubmitting: true, error: null});
        this.props.onLogin(username, password)
            .catch(err => {
                this.setState({
                    error: err.message || 'Login failed.',
                    isSubmitting: false
                });
            });
    }

    handleRegisterClick () {
        this.props.onRegisterClick();
    }

    render () {
        const {username, password, isSubmitting, error} = this.state;

        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginBox}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>⚛</span>
                        <h1 className={styles.title}>Scratch Quantum</h1>
                    </div>

                    <form
                        className={styles.form}
                        onSubmit={this.handleSubmit}
                    >
                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="username"
                            >
                                Username
                            </label>
                            <input
                                className={styles.input}
                                id="username"
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
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <input
                                className={styles.input}
                                id="password"
                                type="password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                placeholder="Enter your password"
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
                            {isSubmitting ? 'Logging in...' : 'Log in'}
                        </button>
                    </form>

                    <div className={styles.registerSection}>
                        <span>{'Don\'t have an account? '}</span>
                        <button
                            className={styles.registerLink}
                            onClick={this.handleRegisterClick}
                            type="button"
                        >
                            Sign up
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
    onRegisterClick: PropTypes.func.isRequired
};

export default LoginPage;
