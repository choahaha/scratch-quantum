import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';

import {supabase} from './supabase-client.js';
import {setUser, setLoading} from '../reducers/auth.js';
import LoginPage from '../components/login/login-page.jsx';
import RegisterModal from '../components/login/register-modal.jsx';

const AuthManagerHOC = function (WrappedComponent) {
    class AuthManagerComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleLogin',
                'handleRegister',
                'handleLogout',
                'handleRegisterClick',
                'handleRegisterClose'
            ]);
            this.state = {
                showRegisterModal: false
            };
        }

        componentDidMount () {
            // Check initial session
            this.checkSession();

            // Listen for auth state changes
            const {data: {subscription}} = supabase.auth.onAuthStateChange(
                (event, session) => {
                    if (session?.user) {
                        this.props.dispatchSetUser(session.user, null);
                        this.fetchProfile(session.user.id).then(profile => {
                            if (profile) {
                                this.props.dispatchSetUser(session.user, profile);
                            }
                        });
                    } else {
                        this.props.dispatchSetUser(null, null);
                    }
                }
            );

            this.authSubscription = subscription;
        }

        componentWillUnmount () {
            if (this.authSubscription) {
                this.authSubscription.unsubscribe();
            }
        }

        async checkSession () {
            try {
                const {data: {session}} = await supabase.auth.getSession();
                if (session?.user) {
                    // 먼저 유저 설정하여 로딩 해제
                    this.props.dispatchSetUser(session.user, null);
                    // 프로필은 백그라운드에서 로드
                    this.fetchProfile(session.user.id).then(profile => {
                        if (profile) {
                            this.props.dispatchSetUser(session.user, profile);
                        }
                    });
                } else {
                    this.props.dispatchSetUser(null, null);
                }
            } catch (error) {
                console.error('Session check error:', error);
                this.props.dispatchSetUser(null, null);
            }
        }

        async fetchProfile (userId) {
            try {
                const {data, error} = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Profile fetch error:', error);
                    return null;
                }
                return data;
            } catch (error) {
                console.error('Profile fetch error:', error);
                return null;
            }
        }

        async handleLogin (username, password) {
            // Use username as email format for Supabase Auth
            const email = `${username}@scratch-quantum.local`;

            const {data, error} = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw new Error(
                    error.message === 'Invalid login credentials'
                        ? '아이디 또는 비밀번호가 올바르지 않습니다.'
                        : error.message
                );
            }

            return data;
        }

        async handleRegister (username, displayName, password) {
            const email = `${username}@scratch-quantum.local`;

            // Sign up with Supabase Auth
            const {data: authData, error: authError} = await supabase.auth.signUp({
                email,
                password
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    throw new Error('이미 사용 중인 아이디입니다.');
                }
                throw new Error(authError.message);
            }

            if (!authData.user) {
                throw new Error('회원가입에 실패했습니다.');
            }

            // Create profile in users table
            const {error: profileError} = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    username: username,
                    email: authData.user.email,
                    role: 'student'
                });

            if (profileError) {
                // If profile creation fails, we should handle this gracefully
                console.error('Profile creation error:', profileError);
                if (profileError.code === '23505') {
                    throw new Error('이미 사용 중인 아이디입니다.');
                }
                throw new Error('프로필 생성에 실패했습니다.');
            }

            return authData;
        }

        async handleLogout () {
            await supabase.auth.signOut();
            // Reload the page to clear all VM state and blocks
            window.location.reload();
        }

        handleRegisterClick () {
            this.setState({showRegisterModal: true});
        }

        handleRegisterClose () {
            this.setState({showRegisterModal: false});
        }

        render () {
            const {
                isAuthenticated,
                isLoading,
                /* eslint-disable no-unused-vars */
                dispatchSetUser,
                dispatchSetLoading,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;

            // Show loading spinner
            if (isLoading) {
                return (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '18px'
                        }}
                    >
                        로딩 중...
                    </div>
                );
            }

            // Show login page if not authenticated
            if (!isAuthenticated) {
                return (
                    <React.Fragment>
                        <LoginPage
                            onLogin={this.handleLogin}
                            onRegisterClick={this.handleRegisterClick}
                        />
                        {this.state.showRegisterModal && (
                            <RegisterModal
                                onClose={this.handleRegisterClose}
                                onRegister={this.handleRegister}
                            />
                        )}
                    </React.Fragment>
                );
            }

            // Show the wrapped component (GUI) if authenticated
            return (
                <WrappedComponent
                    {...componentProps}
                    onLogOut={this.handleLogout}
                />
            );
        }
    }

    AuthManagerComponent.propTypes = {
        dispatchSetLoading: PropTypes.func.isRequired,
        dispatchSetUser: PropTypes.func.isRequired,
        isAuthenticated: PropTypes.bool.isRequired,
        isLoading: PropTypes.bool.isRequired
    };

    const mapStateToProps = state => ({
        isAuthenticated: state.scratchGui.auth.isAuthenticated,
        isLoading: state.scratchGui.auth.isLoading
    });

    const mapDispatchToProps = dispatch => ({
        dispatchSetUser: (user, profile) => dispatch(setUser(user, profile)),
        dispatchSetLoading: isLoading => dispatch(setLoading(isLoading))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(AuthManagerComponent);
};

export default AuthManagerHOC;
