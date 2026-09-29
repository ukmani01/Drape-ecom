import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Loads the editorial type pairing (Bodoni Moda for display, Inter for body)
// once per document. Safe to call from multiple components.
const useEditorialFonts = () => {
  useEffect(() => {
    if (document.getElementById('editorial-fonts')) return;
    const link = document.createElement('link');
    link.id = 'editorial-fonts';
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,500&family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);
};

const INK = '#0a0a0a';
const INK_SOFT = '#3d3b37';
const INK_FAINT = '#9a9690';
const RULE = '#e6e3dc';
const PAPER_WARM = '#fafaf8';
const ACCENT = '#b3121c';

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEditorialFonts();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect only after auth is fully loaded
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: INK, borderTopColor: 'transparent' }}
          ></div>
          <p
            className="mt-3 text-[11px] uppercase tracking-[2px]"
            style={{ color: INK_FAINT }}
          >
            Loading
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-16"
      style={{ backgroundColor: '#ffffff', fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full max-w-[440px] transition-all duration-700 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
        }}
      >
        <span
          className="block text-center text-[10.5px] font-semibold uppercase mb-3"
          style={{ color: ACCENT, letterSpacing: '3.5px' }}
        >
          Welcome Back
        </span>
        <h1
          className="text-center uppercase font-medium"
          style={{
            fontFamily: "'Bodoni Moda', serif",
            fontSize: 'clamp(30px, 4vw, 40px)',
            letterSpacing: '-0.5px',
            color: INK,
          }}
        >
          Sign In
        </h1>
        <p
          className="text-center mt-3 mb-10 text-[13px] font-light"
          style={{ color: INK_FAINT }}
        >
          Access your account to continue
        </p>

        {error && (
          <div
            className="mb-6 px-4 py-3 text-[13px] text-center"
            style={{ border: `1px solid ${ACCENT}`, color: ACCENT, backgroundColor: '#f7e6e5' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5 flex flex-col gap-[7px]">
            <label
              htmlFor="login-email"
              className="text-[10px] font-semibold uppercase"
              style={{ letterSpacing: '1.2px', color: INK_FAINT }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="px-[14px] py-[12px] text-[13.5px] outline-none transition-colors duration-200"
              style={{ border: `1px solid ${RULE}`, backgroundColor: PAPER_WARM, color: INK }}
              onFocus={(e) => (e.target.style.borderColor = INK)}
              onBlur={(e) => (e.target.style.borderColor = RULE)}
            />
          </div>

          <div className="mb-3 flex flex-col gap-[7px]">
            <label
              htmlFor="login-password"
              className="text-[10px] font-semibold uppercase"
              style={{ letterSpacing: '1.2px', color: INK_FAINT }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="px-[14px] py-[12px] text-[13.5px] outline-none transition-colors duration-200"
              style={{ border: `1px solid ${RULE}`, backgroundColor: PAPER_WARM, color: INK }}
              onFocus={(e) => (e.target.style.borderColor = INK)}
              onBlur={(e) => (e.target.style.borderColor = RULE)}
            />
          </div>

          <div className="flex justify-end mb-8 mt-3">
            <Link
              to="/forgot-password"
              className="text-[12px] underline"
              style={{ color: INK_FAINT }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[16px] text-[11px] font-semibold uppercase transition-colors duration-300 disabled:opacity-40 disabled:pointer-events-none"
            style={{ letterSpacing: '2.4px', backgroundColor: INK, color: '#fff', border: `1px solid ${INK}` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = ACCENT;
              e.currentTarget.style.borderColor = ACCENT;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = INK;
              e.currentTarget.style.borderColor = INK;
            }}
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[13px] mt-9" style={{ color: INK_FAINT }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold underline" style={{ color: ACCENT }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;