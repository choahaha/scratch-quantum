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
                <div className={styles.brandSide}>
                    <div className={styles.brandLogo}>{'⟨ Scratch Quantum ⟩'}</div>
                    <div className={styles.brandMid}>
                        <h2 className={styles.brandHeadline}>
                            {'Build quantum circuits,'}<br />{'block by block.'}
                        </h2>
                        <p className={styles.brandSub}>{'Sign in to start experimenting.'}</p>
                        <svg
                            className={styles.brandArt}
                            width="180"
                            height="64"
                            viewBox="0 0 180 64"
                            fill="none"
                        >
                            <line
                                x1="0"
                                y1="20"
                                x2="180"
                                y2="20"
                                stroke="#4f46e5"
                                strokeWidth="2"
                            />
                            <line
                                x1="0"
                                y1="46"
                                x2="180"
                                y2="46"
                                stroke="#4f46e5"
                                strokeWidth="2"
                            />
                            <rect
                                x="42"
                                y="7"
                                width="26"
                                height="26"
                                rx="5"
                                fill="#a5b4fc"
                            />
                            <rect
                                x="112"
                                y="33"
                                width="26"
                                height="26"
                                rx="5"
                                fill="#818cf8"
                            />
                            <circle
                                cx="22"
                                cy="20"
                                r="6"
                                fill="#c7d2fe"
                            />
                            <circle
                                cx="158"
                                cy="46"
                                r="6"
                                fill="#c7d2fe"
                            />
                        </svg>
                    </div>
                </div>

                <div className={styles.formSide}>
                    <div className={styles.formInner}>
                        <h1 className={styles.title}>{'Welcome back'}</h1>
                        <p className={styles.subtitle}>{'Log in to your account'}</p>

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
            </div>
        );
    }
}

LoginPage.propTypes = {
    onLogin: PropTypes.func.isRequired,
    onRegisterClick: PropTypes.func.isRequired
};

export default LoginPage;
