import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import type { Event, Announcement } from '../api/types';

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    api.get('/events').then((res) => setEvents(res.data.slice(0, 3)));
    api.get('/announcements').then((res) => setAnnouncements(res.data.slice(0, 3)));
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section style={heroStyles.hero}>
        <img src="/logo.png" alt="Teens Aloud Foundation" style={{ height: 70, width: 'auto', marginBottom: '1rem' }} />
        <h1 style={heroStyles.title}>Welcome to Teens Aloud Foundation</h1>
        <p style={heroStyles.subtitle}>
          Join us for exciting events, workshops, and a community of passionate teens making a difference in Kenya.
        </p>
        {user ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#475569' }}>
              <i className="fa-solid fa-hand" style={{ marginRight: '0.3rem' }}></i> Hey, <strong>{user.name || user.username}</strong>!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/profile" className="btn"><i className="fa-solid fa-user" style={{ marginRight: '0.4rem' }}></i>My Profile</Link>
              <Link to="/events" className="btn btn-secondary"><i className="fa-solid fa-calendar-days" style={{ marginRight: '0.4rem' }}></i>View Events</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn"><i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Join the Club</Link>
            <Link to="/login" className="btn btn-secondary"><i className="fa-solid fa-right-to-bracket" style={{ marginRight: '0.4rem' }}></i>Login</Link>
          </div>
        )}
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2><i className="fa-solid fa-bullhorn" style={{ marginRight: '0.5rem' }}></i>Announcements</h2>
          {announcements.map((a) => (
            <div key={a.id} className="card" style={{ marginTop: '1rem' }}>
              <h3>{a.is_pinned ? <i className="fa-solid fa-thumbtack" style={{ marginRight: '0.3rem', color: '#2563eb' }}></i> : ''}{a.title}</h3>
              <p>{a.content}</p>
            </div>
          ))}
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2><i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>Upcoming Events</h2>
          <div className="grid-2" style={{ marginTop: '1rem' }}>
            {events.map((event) => (
              <div key={event.id} className="card">
                <h3>{event.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#2563eb' }}>
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {event.location && (
                  <p style={{ fontSize: '0.85rem' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>{event.location}</p>
                )}
                {event.description && (
                  <p style={{ marginTop: '0.5rem' }}>{event.description}</p>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/events" className="btn">View All Events <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem' }}></i></Link>
          </div>
        </section>
      )}
    </div>
  );
};

const heroStyles: Record<string, React.CSSProperties> = {
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
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
};

export default Home;
