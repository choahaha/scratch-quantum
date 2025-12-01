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
            this.setState({error: '모든 필드를 입력해주세요.'});
            return;
        }

        if (password !== confirmPassword) {
            this.setState({error: '비밀번호가 일치하지 않습니다.'});
            return;
        }

        if (password.length < 6) {
            this.setState({error: '비밀번호는 6자 이상이어야 합니다.'});
            return;
        }

        this.setState({isSubmitting: true, error: null});
        this.props.onRegister(username, displayName, password)
            .then(() => {
                this.props.onClose();
            })
            .catch(err => {
                this.setState({
                    error: err.message || '회원가입에 실패했습니다.',
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
                        <h2 className={styles.headerTitle}>회원가입</h2>
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
                                아이디
                            </label>
                            <input
                                className={styles.input}
                                id="reg-username"
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
                                htmlFor="reg-displayname"
                            >
                                이름
                            </label>
                            <input
                                className={styles.input}
                                id="reg-displayname"
                                type="text"
                                value={displayName}
                                onChange={this.handleDisplayNameChange}
                                placeholder="이름을 입력하세요"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-password"
                            >
                                비밀번호
                            </label>
                            <input
                                className={styles.input}
                                id="reg-password"
                                type="password"
                                value={password}
                                onChange={this.handlePasswordChange}
                                placeholder="비밀번호를 입력하세요"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label
                                className={styles.label}
                                htmlFor="reg-confirm"
                            >
                                비밀번호 확인
                            </label>
                            <input
                                className={styles.input}
                                id="reg-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={this.handleConfirmPasswordChange}
                                placeholder="비밀번호를 다시 입력하세요"
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
                            {isSubmitting ? '가입 중...' : '가입하기'}
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
