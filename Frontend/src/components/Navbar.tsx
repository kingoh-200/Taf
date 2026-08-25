import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import type { User } from '../api/types';

const Navbar = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount and when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Also sync on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const publicLinks = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/about', label: 'About', icon: 'fa-users' },
    { to: '/ministries', label: 'Ministries', icon: 'fa-church' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { to: '/members', label: 'Members', icon: 'fa-user-group' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-images' },
  ];

  return (
    <nav className="navbar" style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <img src="/logo.png" alt="Teens Aloud Foundation" style={styles.logoImg} />
        </Link>

        {/* Desktop links */}
        <div style={styles.links} className="navbar-desktop-links">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              style={{
                ...styles.link,
                color: location.pathname === link.to ? 'var(--primary)' : 'var(--text-light)',
                fontWeight: location.pathname === link.to ? 600 : 400,
              }}
            >
              <i className={`fa-solid ${link.icon}`} style={{ marginRight: '0.4rem', fontSize: '0.85rem' }}></i>
              {link.label}
            </Link>
          ))}

          <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>

          {user ? (
            <div style={styles.userMenu} ref={dropdownRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.profileBtn}>
                {user.profile_image ? (
                  <img src={user.profile_image} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <i className="fa-solid fa-user" style={{ fontSize: '1rem', color: 'var(--text)' }}></i>
                )}
                <span style={styles.userName}>{user.name || user.username}</span>
                <i className={`fa-solid fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', marginLeft: '0.3rem', color: 'var(--text-light)' }}></i>
              </button>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    {user.profile_image ? (
                      <img src={user.profile_image} alt="Profile" style={styles.dropdownAvatar} />
                    ) : (
                      <div style={styles.dropdownAvatarFallback}>
                        <i className="fa-solid fa-user" style={{ fontSize: '1.2rem' }}></i>
                      </div>
                    )}
                    <div>
                      <div style={styles.dropdownName}>{user.name || user.username}</div>
                      <div style={styles.dropdownRole}>
                        <i className={`fa-solid ${user.role === 'admin' ? 'fa-crown' : 'fa-id-badge'}`} style={{ marginRight: '0.3rem' }}></i>
                        {user.role === 'admin' ? 'Admin' : 'Member'}
                      </div>
                    </div>
                  </div>

                  <div style={styles.dropdownDivider}></div>

                  <Link to="/profile" style={styles.dropdownItem} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <i className="fa-solid fa-user"></i> My Profile
                  </Link>

                  {user.role === 'admin' && (
                    <Link to="/admin" style={styles.dropdownItem} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <i className="fa-solid fa-gear"></i> Admin Dashboard
                    </Link>
                  )}

                  <div style={styles.dropdownDivider}></div>

                  <button onClick={handleLogout} style={{...styles.dropdownItem, ...styles.dropdownLogout}} className="dropdown-item">
                    <i className="fa-solid fa-right-from-bracket"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}><i className="fa-solid fa-right-to-bracket" style={{ marginRight: '0.3rem' }}></i>Login</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-overlay">
          {publicLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              <i className={`fa-solid ${link.icon}`}></i>
              {link.label}
            </Link>
          ))}

          <div className="mobile-divider"></div>

          <button onClick={toggleTheme} className="mobile-btn">
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {user ? (
            <>
              <Link to="/profile" className="mobile-nav-link">
                <i className="fa-solid fa-user"></i>
                My Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="mobile-nav-link">
                  <i className="fa-solid fa-gear"></i>
                  Admin Dashboard
                </Link>
              )}
              <div className="mobile-divider"></div>
              <button onClick={handleLogout} className="mobile-btn danger">
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-login">
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '0.4rem' }}></i>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: 'var(--bg-elevated)',
    borderBottom: '2px solid var(--primary)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    transition: 'background 0.3s',
  },
  inner: {
    width: '100%',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  logoImg: {
    height: 40,
    width: 'auto',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  loginBtn: {
    background: 'var(--primary)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  userMenu: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    borderRadius: 24,
    padding: '0.35rem 0.8rem 0.35rem 0.35rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: 'var(--text)',
    transition: 'background 0.2s, border-color 0.2s',
  },
  avatarImg: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userName: {
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'var(--text)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 220,
    background: 'var(--bg-elevated)',
    borderRadius: 12,
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.8rem 1rem',
    background: 'var(--bg-alt)',
  },
  dropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  dropdownAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A0DC, #F7941D)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownName: {
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'var(--text)',
  },
  dropdownRole: {
    fontSize: '0.75rem',
    color: 'var(--text-light)',
    marginTop: '0.1rem',
  },
  dropdownDivider: {
    height: 1,
    background: 'var(--border)',
    margin: '0.3rem 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 1rem',
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    textDecoration: 'none',
    transition: 'background 0.15s',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  dropdownLogout: {
    color: 'var(--error)',
  },
};

export default Navbar;
