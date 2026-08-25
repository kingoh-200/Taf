import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { retry } from '../api/client';
import type { Event, Announcement } from '../api/types';

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    // Load data with retry for Render cold starts
    Promise.allSettled([
      retry(() => api.get('/events')),
      retry(() => api.get('/announcements')),
      retry(() => api.get('/members')),
    ]).then(([eventsRes, annRes, membersRes]) => {
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data.slice(0, 3));
      if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data.slice(0, 3));
      if (membersRes.status === 'fulfilled') setMemberCount(membersRes.value.data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const initials = user
    ? (user.name || user.username).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="page">
      {/* Hero Section */}
      <section style={heroStyles.hero}>
        <img src="/logo.png" alt="Teens Aloud Foundation" style={{ height: 70, width: 'auto', marginBottom: '1rem' }} />

        {user ? (
          /* ===== LOGGED-IN HERO ===== */
          <div style={heroStyles.loggedInHero}>
            <div style={heroStyles.welcomeRow}>
              {/* Profile card */}
              <div style={heroStyles.profileCard}>
                {user.profile_image ? (
                  <img src={user.profile_image} alt="You" style={heroStyles.profileImg} />
                ) : (
                  <div style={heroStyles.profileAvatar}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={heroStyles.greeting}>
                    <i className="fa-solid fa-hand" style={{ marginRight: '0.3rem' }}></i>
                    Welcome back, <strong>{user.name || user.username}</strong>!
                  </p>
                  <div style={heroStyles.roleRow}>
                    <span style={{
                      ...heroStyles.roleBadge,
                      background: user.role === 'admin' ? '#fef3c7' : '#e0f4fc',
                      color: user.role === 'admin' ? '#92400e' : '#0077A8',
                    }}>
                      <i className={`fa-solid ${user.role === 'admin' ? 'fa-crown' : 'fa-id-badge'}`} style={{ marginRight: '0.3rem', fontSize: '0.75rem' }}></i>
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div style={heroStyles.quickActions}>
                <Link to="/profile" style={heroStyles.actionBtn}>
                  <i className="fa-solid fa-user"></i>
                  <span>My Profile</span>
                </Link>
                <Link to="/members" style={heroStyles.actionBtn}>
                  <i className="fa-solid fa-users"></i>
                  <span>Members</span>
                </Link>
                <Link to="/events" style={heroStyles.actionBtn}>
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>Events</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" style={{...heroStyles.actionBtn, ...heroStyles.adminAction}}>
                    <i className="fa-solid fa-gear"></i>
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ===== LOGGED-OUT HERO ===== */
          <div>
            <h1 style={heroStyles.title}>Welcome to Teens Aloud Foundation</h1>
            <p style={heroStyles.subtitle}>
              Join us for exciting events, workshops, and a community of passionate teens making a difference in Kenya.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/register" className="btn">
                <i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Join the Club
              </Link>
              <Link to="/login" className="btn btn-secondary">
                <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '0.4rem' }}></i>Login
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      {user && !loading && (
        <section style={heroStyles.statsRow}>
          <div style={heroStyles.stat}>
            <i className="fa-solid fa-calendar-days" style={{ fontSize: '1.5rem', color: '#00A0DC' }}></i>
            <span style={heroStyles.statNumber}>{events.length}</span>
            <span style={heroStyles.statLabel}>Events</span>
          </div>
          <div style={heroStyles.stat}>
            <i className="fa-solid fa-users" style={{ fontSize: '1.5rem', color: '#00A0DC' }}></i>
            <span style={heroStyles.statNumber}>{memberCount}</span>
            <span style={heroStyles.statLabel}>Members</span>
          </div>
          <div style={heroStyles.stat}>
            <i className="fa-solid fa-bullhorn" style={{ fontSize: '1.5rem', color: '#00A0DC' }}></i>
            <span style={heroStyles.statNumber}>{announcements.length}</span>
            <span style={heroStyles.statLabel}>Updates</span>
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <div style={heroStyles.sectionHeader}>
            <h2 style={{ margin: 0 }}>
              <i className="fa-solid fa-bullhorn" style={{ marginRight: '0.5rem', color: '#F7941D' }}></i>
              Announcements
            </h2>
            {user && <Link to="/events" style={heroStyles.seeAll}>See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.2rem' }}></i></Link>}
          </div>
          {announcements.map((a) => (
            <div key={a.id} className="card" style={{ marginTop: '0.8rem' }}>
              <h3 style={{ margin: '0 0 0.3rem' }}>
                {a.is_pinned ? <i className="fa-solid fa-thumbtack" style={{ marginRight: '0.3rem', color: '#F7941D', fontSize: '0.9rem' }}></i> : ''}
                {a.title}
              </h3>
              <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>{a.content}</p>
            </div>
          ))}
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <div style={heroStyles.sectionHeader}>
            <h2 style={{ margin: 0 }}>
              <i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem', color: '#00A0DC' }}></i>
              Upcoming Events
            </h2>
            {user && <Link to="/events" style={heroStyles.seeAll}>See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.2rem' }}></i></Link>}
          </div>
          <div className="grid-2" style={{ marginTop: '0.8rem' }}>
            {events.map((event) => (
              <div key={event.id} className="card" style={{ padding: '1.2rem' }}>
                <h3 style={{ margin: '0 0 0.4rem' }}>{event.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#00A0DC', margin: '0 0 0.3rem', fontWeight: 500 }}>
                  <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
                {event.location && (
                  <p style={{ fontSize: '0.85rem', margin: '0 0 0.3rem', color: '#64748b' }}>
                    <i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>{event.location}
                  </p>
                )}
                {event.description && (
                  <p style={{ marginTop: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>{event.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
          Loading club data...
        </div>
      )}

      {/* Not logged in CTA */}
      {!user && !loading && events.length === 0 && announcements.length === 0 && (
        <section style={{ textAlign: 'center', padding: '3rem 2rem', marginTop: '2rem' }}>
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
            <i className="fa-solid fa-rocket" style={{ marginRight: '0.5rem', color: '#00A0DC' }}></i>
            We're just getting started — join us and be part of the journey!
          </p>
        </section>
      )}
    </div>
  );
};

const heroStyles: Record<string, React.CSSProperties> = {
  hero: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'linear-gradient(135deg, #e0f4fc 0%, #fef3e2 100%)',
    borderRadius: 12,
    marginTop: '1.5rem',
    border: '1px solid #d4eef7',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: '#64748b',
    marginBottom: '1.5rem',
    maxWidth: 500,
    margin: '0 auto 1.5rem',
  },
  /* Logged-in hero */
  loggedInHero: {
    width: '100%',
  },
  welcomeRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1.5rem',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#fff',
    borderRadius: 16,
    padding: '1rem 1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    maxWidth: 400,
    width: '100%',
  },
  profileImg: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #00A0DC',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A0DC, #F7941D)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  greeting: {
    fontSize: '1.15rem',
    margin: 0,
    color: '#1e293b',
    textAlign: 'left' as const,
  },
  roleRow: {
    marginTop: '0.3rem',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  quickActions: {
    display: 'flex',
    gap: '0.8rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  actionBtn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.8rem 1.2rem',
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    textDecoration: 'none',
    color: '#475569',
    fontSize: '0.8rem',
    fontWeight: 500,
    transition: 'all 0.2s',
    minWidth: 80,
  },
  adminAction: {
    borderColor: '#F7941D',
    color: '#F7941D',
  },
  /* Stats */
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.2rem',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  /* Section headers */
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    fontSize: '0.85rem',
    color: '#00A0DC',
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default Home;
