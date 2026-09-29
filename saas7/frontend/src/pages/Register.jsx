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
const INK_FAINT = '#9a9690';
const RULE = '#e6e3dc';
const PAPER_WARM = '#fafaf8';
const ACCENT = '#b3121c';

const fieldStyle = {
  border: `1px solid ${RULE}`,
  backgroundColor: PAPER_WARM,
  color: INK,
};

const Field = ({ label, ...props }) => (
  <div className="flex flex-col gap-[7px]">
    <label
      htmlFor={props.id}
      className="text-[10px] font-semibold uppercase"
      style={{ letterSpacing: '1.2px', color: INK_FAINT }}
    >
      {label}
    </label>
    <input
      {...props}
      className="px-[14px] py-[12px] text-[13.5px] outline-none transition-colors duration-200 w-full"
      style={fieldStyle}
      onFocus={(e) => (e.target.style.borderColor = INK)}
      onBlur={(e) => (e.target.style.borderColor = RULE)}
    />
  </div>
);

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', storeName: '', storeSlug: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEditorialFonts();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Get Started
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
          Create Account
        </h1>
        <p className="text-center mt-3 mb-10 text-[13px] font-light" style={{ color: INK_FAINT }}>
          Set up your store in minutes
        </p>

        {error && (
          <div
            className="mb-6 px-4 py-3 text-[13px] text-center"
            style={{ border: `1px solid ${ACCENT}`, color: ACCENT, backgroundColor: '#f7e6e5' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field
            id="reg-name"
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Jane Doe"
          />
          <Field
            id="reg-email"
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />
          <Field
            id="reg-password"
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              id="reg-store-name"
              label="Store Name"
              name="storeName"
              value={form.storeName}
              onChange={handleChange}
              required
              placeholder="Maison Noir"
            />
            <Field
              id="reg-store-slug"
              label="Store Slug"
              name="storeSlug"
              value={form.storeSlug}
              onChange={handleChange}
              required
              placeholder="maison-noir"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[16px] text-[11px] font-semibold uppercase transition-colors duration-300 mt-3 disabled:opacity-40 disabled:pointer-events-none"
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
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-[13px] mt-9" style={{ color: INK_FAINT }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold underline" style={{ color: ACCENT }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;