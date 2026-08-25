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

  return (
    <div className="page" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h1><i className="fa-solid fa-user-plus" style={{ marginRight: '0.5rem' }}></i>Sign Up</h1>
      <p>Create an account to join the club.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name"><i className="fa-solid fa-id-card" style={{ marginRight: '0.3rem' }}></i>Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="username"><i className="fa-solid fa-at" style={{ marginRight: '0.3rem' }}></i>Username *</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email"><i className="fa-solid fa-envelope" style={{ marginRight: '0.3rem' }}></i>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="john@school.edu"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password"><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword"><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>Confirm Password *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Creating account...</> : <><i className="fa-solid fa-user-plus" style={{ marginRight: '0.3rem' }}></i>Sign Up</>}
        </button>
      </form>

      <p style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-light)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
