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
            this.setState({error: '아이디와 비밀번호를 입력해주세요.'});
            return;
        }

        this.setState({isSubmitting: true, error: null});
        this.props.onLogin(username, password)
            .catch(err => {
                this.setState({
                    error: err.message || '로그인에 실패했습니다.',
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
                                아이디
                            </label>
                            <input
                                className={styles.input}
                                id="username"
                                type="text"
                                value={username}
                                onChange={this.handleUsernameChange}
                                placeholder="아이디를 입력하세요"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="password"
                            >
                                비밀번호
                            </label>
                            <input
                                className={styles.input}
                                id="password"
                                type="password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                placeholder="비밀번호를 입력하세요"
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
                            {isSubmitting ? '로그인 중...' : '로그인'}
                        </button>
                    </form>

                    <div className={styles.registerSection}>
                        <span>계정이 없나요? </span>
                        <button
                            className={styles.registerLink}
                            onClick={this.handleRegisterClick}
                            type="button"
                        >
                            회원가입
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
