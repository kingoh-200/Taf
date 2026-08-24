import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import type { User } from '../api/types';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on navigation
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDropdownOpen(false);
    navigate('/');
  };

  const publicLinks = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/events', label: 'Events', icon: 'fa-calendar-days' },
    { to: '/members', label: 'Members', icon: 'fa-users' },
    { to: '/gallery', label: 'Gallery', icon: 'fa-images' },
  ];

  const links = publicLinks;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username.charAt(0).toUpperCase() || '?';

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}><img src="/logo.png" alt="Teens Aloud Foundation" style={styles.logoImg} /></Link>
        <div style={styles.links}>
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                color: location.pathname === link.to ? '#2563eb' : '#475569',
                fontWeight: location.pathname === link.to ? 600 : 400,
              }}
            >
              <i className={`fa-solid ${link.icon}`} style={{ marginRight: '0.4rem', fontSize: '0.85rem' }}></i>
              {link.label}
            </Link>
          ))}

          {user ? (
            <div style={styles.userMenu} ref={dropdownRef}>
              {/* Profile button with dropdown */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={styles.profileBtn}
              >
                {user.profile_image ? (
                  <img src={user.profile_image} alt="Profile" style={styles.avatarImg} />
                ) : (
                  <i className="fa-solid fa-user" style={{ fontSize: '1rem' }}></i>
                )}
                <span style={styles.userName}>{user.name || user.username}</span>
                <i className={`fa-solid fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', marginLeft: '0.3rem' }}></i>
              </button>

              {/* Dropdown menu */}
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
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    background: '#fff',
    borderBottom: '2px solid #00A0DC',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    width: '100%',
    padding: '0 2rem',
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
    background: '#00A0DC',
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
    background: '#e0f4fc',
    border: '1px solid #b3e0f2',
    borderRadius: 24,
    padding: '0.35rem 0.8rem 0.35rem 0.35rem',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#1e293b',
    transition: 'background 0.2s',
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
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 220,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    zIndex: 200,
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.8rem 1rem',
    background: '#f8fafc',
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
    color: '#1e293b',
  },
  dropdownRole: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.1rem',
  },
  dropdownDivider: {
    height: 1,
    background: '#e2e8f0',
    margin: '0.3rem 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.6rem 1rem',
    fontSize: '0.9rem',
    color: '#475569',
    textDecoration: 'none',
    transition: 'background 0.15s',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  dropdownLogout: {
    color: '#dc2626',
  },
};

export default Navbar;
