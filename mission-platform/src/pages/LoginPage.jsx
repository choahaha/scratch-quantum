import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

// Mirrors scratch-gui/src/components/login/login-page.jsx so the mission
// platform and the editor share one look. Keep the two in sync.
const LoginPage = () => {
    const {login, register} = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const isRegister = mode === 'register';

    const handleSubmit = async event => {
        event.preventDefault();
        if (!username || !password) {
            setError('Please enter your username and password.');
            return;
        }
        setError('');
        setBusy(true);
        try {
            if (isRegister) {
                await register(username.trim(), password);
            } else {
                await login(username.trim(), password);
            }
            navigate('/', {replace: true});
        } catch (err) {
            setError(err.message || 'Login failed.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="login-container">
            <div className="brand-side">
                <div className="brand-logo">Qubit123</div>
                <div className="brand-mid">
                    <h2 className="brand-headline">
                        {'Build quantum circuits,'}<br />{'block by block.'}
                    </h2>
                    <p className="brand-sub">Sign in to start your missions.</p>
                    <svg
                        className="brand-art"
                        width="180"
                        height="64"
                        viewBox="0 0 180 64"
                        fill="none"
                    >
                        <line x1="0" y1="20" x2="180" y2="20" stroke="#4f46e5" strokeWidth="2" />
                        <line x1="0" y1="46" x2="180" y2="46" stroke="#4f46e5" strokeWidth="2" />
                        <rect x="42" y="7" width="26" height="26" rx="5" fill="#a5b4fc" />
                        <rect x="112" y="33" width="26" height="26" rx="5" fill="#818cf8" />
                        <circle cx="22" cy="20" r="6" fill="#c7d2fe" />
                        <circle cx="158" cy="46" r="6" fill="#c7d2fe" />
                    </svg>
                </div>
            </div>

            <div className="form-side">
                <div className="form-inner">
                    <h1 className="login-title">{isRegister ? 'Create account' : 'Welcome back'}</h1>
                    <p className="login-subtitle">
                        {isRegister ? 'Sign up to start your missions' : 'Log in to your account'}
                    </p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="username">Username</label>
                            <input
                                className="text-input"
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                disabled={busy}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="password">Password</label>
                            <input
                                className="text-input"
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete={isRegister ? 'new-password' : 'current-password'}
                                disabled={busy}
                            />
                        </div>

                        {error && <div className="form-error-box">{error}</div>}

                        <button className="submit-button" type="submit" disabled={busy}>
                            {busy
                                ? (isRegister ? 'Signing up...' : 'Logging in...')
                                : (isRegister ? 'Sign up' : 'Log in')}
                        </button>
                    </form>

                    <div className="register-section">
                        <span>{isRegister ? 'Already have an account? ' : 'Don\'t have an account? '}</span>
                        <button
                            className="register-link"
                            type="button"
                            onClick={() => {
                                setMode(isRegister ? 'login' : 'register');
                                setError('');
                            }}
                        >
                            {isRegister ? 'Log in' : 'Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
