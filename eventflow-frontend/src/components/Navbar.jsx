import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, LogOut, User, LayoutDashboard, Calendar, Ticket } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/client';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.get('/api/notifications/').then(({ data }) => {
      const items = Array.isArray(data) ? data : data.results || [];
      setUnread(items.filter((n) => !n.is_read).length);
    }).catch(() => {});
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = user
    ? isOrganizer
      ? [
          { to: '/events', label: 'All Events', icon: <Calendar size={15} /> },
          { to: '/organizer/my-events', label: 'My Events', icon: <LayoutDashboard size={15} /> },
          { to: '/my-tickets', label: 'My Tickets', icon: <Ticket size={15} /> },
        ]
      : [
          { to: '/events', label: 'All Events', icon: <Calendar size={15} /> },
          { to: '/my-tickets', label: 'My Tickets', icon: <Ticket size={15} /> },
        ]
    : [];

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">⚡</span>
          <span className="brand-text">EventFlow</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {/* Theme toggle - always visible */}
          <button className="icon-btn" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user && (
            <Link to="/notifications" className="icon-btn notif-btn" title="Notifications">
              <Bell size={18} />
              {unread > 0 && <span className="notif-dot" />}
            </Link>
          )}

          {user ? (
            <div className="user-menu-wrap">
              <button
                className="user-chip"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <User size={15} />
                <span>{user.username || user.email}</span>
              </button>
              {menuOpen && (
                <div className="dropdown">
                  <div className="dropdown-info">
                    <span className="dropdown-email">{user.email}</span>
                    <span className="badge badge-blue">{isOrganizer ? 'Organizer' : 'Attendee'}</span>
                  </div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav strip */}
      {user && (
        <div className="mobile-nav container">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`mobile-link ${location.pathname.startsWith(l.to) ? 'active' : ''}`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}