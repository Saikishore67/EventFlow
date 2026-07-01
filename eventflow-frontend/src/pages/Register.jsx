import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'attendee' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/events');
    } catch (err) {
      const data = err.response?.data;
      const msg = typeof data === 'object'
        ? Object.values(data).flat().join(' ')
        : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card card">
        <div className="auth-header">
          <span className="auth-logo">⚡</span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Join EventFlow in seconds</p>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input id="username" name="username" value={form.username} onChange={handle} placeholder="cool_username" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="role">I want to…</label>
            <select id="role" name="role" value={form.role} onChange={handle}>
              <option value="attendee">Attend events</option>
              <option value="organizer">Organize events</option>
            </select>
          </div>
          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}