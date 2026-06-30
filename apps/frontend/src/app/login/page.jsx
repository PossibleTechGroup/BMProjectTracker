'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { loginUser } from '@/store/slices/uiSlice';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { authStatus, authError, currentUser } = useSelector(s => s.ui);

  useEffect(() => {
    if (currentUser) {
      router.push('/projects');
    }
  }, [currentUser, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ username, password }));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <h1 className="login-card__title">BM Ecosystem</h1>
          <p className="login-card__subtitle">Sign in to your account</p>
        </div>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {authError && <div className="login-card__error">{authError}</div>}

          <div className="login-card__field">
            <label className="login-card__label">Username</label>
            <input
              className="login-card__input"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-card__field">
            <label className="login-card__label">Password</label>
            <div className="login-card__password-wrap">
              <input
                className="login-card__input login-card__input--password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="login-card__toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="login-card__btn" type="submit" disabled={!username || !password || authStatus === 'loading'}>
            {authStatus === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
