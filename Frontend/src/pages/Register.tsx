import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import type { AuthResponse } from '../api/types';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        username: form.username,
        password: form.password,
        name: form.name || undefined,
        email: form.email || undefined,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputStyle = (field: string): React.CSSProperties => ({
    ...styles.input,
    borderColor: focusedField === field ? '#0077B6' : '#e2e8f0',
    background: focusedField === field ? '#fff' : '#f8fafc',
  });

  return (
    <div style={styles.container}>
      {/* Animated background shapes */}
      <div style={styles.bgShape1} />
      <div style={styles.bgShape2} />
      <div style={styles.bgShape3} />

      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.brandSection}>
          <div style={styles.logoCircle}>
            <i className="fa-solid fa-user-plus" style={{ fontSize: '1.6rem', color: '#fff' }}></i>
          </div>
          <h1 style={styles.title}>Join TAF</h1>
          <p style={styles.subtitle}>Create your Teens Aloud Foundation account</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.5rem' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Name */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <i className="fa-solid fa-id-card" style={styles.inputIcon}></i>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                style={getInputStyle('name')}
              />
            </div>
          </div>

          {/* Username */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <i className="fa-solid fa-at" style={styles.inputIcon}></i>
              <input
                type="text"
                name="username"
                placeholder="Username *"
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                required
                style={getInputStyle('username')}
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <i className="fa-solid fa-envelope" style={styles.inputIcon}></i>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                style={getInputStyle('email')}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <i className="fa-solid fa-lock" style={styles.inputIcon}></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password * (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                style={getInputStyle('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {/* Password strength indicator */}
            {form.password && (
              <div style={styles.strengthBar}>
                <div style={{
                  ...styles.strengthFill,
                  width: form.password.length >= 8 ? '100%' : form.password.length >= 6 ? '60%' : '30%',
                  background: form.password.length >= 8 ? '#22c55e' : form.password.length >= 6 ? '#F7941D' : '#ef4444',
                }} />
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <i className="fa-solid fa-shield-halved" style={styles.inputIcon}></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={form.confirmPassword}
                onChange={handleChange}
                onFocus={() => setFocusedField('confirm')}
                onBlur={() => setFocusedField('')}
                required
                style={getInputStyle('confirm')}
              />
              {form.confirmPassword && (
                <i
                  className={`fa-solid ${form.password === form.confirmPassword ? 'fa-check-circle' : 'fa-times-circle'}`}
                  style={{ color: form.password === form.confirmPassword ? '#22c55e' : '#ef4444', fontSize: '0.9rem' }}
                ></i>
              )}
            </div>
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                Creating account...
              </>
            ) : (
              <>
                <i className="fa-solid fa-rocket" style={{ marginRight: '0.5rem' }}></i>
                Create Account
              </>
            )}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #0077B6 0%, #00A0DC 50%, #F7941D 100%)',
  },
  bgShape1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    top: '-100px',
    left: '-100px',
    animation: 'float 6s ease-in-out infinite',
  },
  bgShape2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.06)',
    bottom: '-50px',
    right: '-50px',
    animation: 'float 8s ease-in-out infinite reverse',
  },
  bgShape3: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    borderRadius: '30%',
    background: 'rgba(255,255,255,0.04)',
    top: '40%',
    right: '30%',
    animation: 'float 10s ease-in-out infinite',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2.5rem 2.5rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.2)',
    position: 'relative',
    zIndex: 1,
    animation: 'slideUp 0.6s ease-out',
  },
  brandSection: {
    textAlign: 'center',
    marginBottom: '1.75rem',
  },
  logoCircle: {
    width: '68px',
    height: '68px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #F7941D, #00A0DC)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
    boxShadow: '0 8px 24px rgba(247, 148, 29, 0.3)',
  },
  title: {
    fontSize: '1.7rem',
    fontWeight: 800,
    color: '#1a1a2e',
    margin: '0 0 0.3rem',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: '#dc2626',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0 0.9rem',
    transition: 'all 0.2s',
  },
  inputIcon: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginRight: '0.65rem',
    width: '16px',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '0.8rem 0',
    fontSize: '0.9rem',
    color: '#1a1a2e',
    outline: 'none',
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
    fontSize: '0.9rem',
  },
  strengthBar: {
    height: '3px',
    background: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '-2px',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'all 0.3s',
  },
  btn: {
    background: 'linear-gradient(135deg, #0077B6, #00A0DC)',
    color: '#fff',
    border: 'none',
    borderRadius: '14px',
    padding: '0.85rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '0.3rem',
    boxShadow: '0 4px 15px rgba(0, 119, 182, 0.3)',
    transition: 'all 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '1.25rem 0',
    gap: '0.75rem',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#e2e8f0',
  },
  dividerText: {
    color: '#94a3b8',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  switchText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.875rem',
    margin: 0,
  },
  link: {
    color: '#0077B6',
    fontWeight: 700,
    textDecoration: 'none',
  },
};

export default Register;
