import { useState, useEffect } from 'react';
import api from '../api/client';
import type { Event } from '../api/types';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading events...</div>;

  return (
    <div className="page">
      <h1><i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>Events</h1>
      <p>Check out what we've been up to and what's coming next.</p>

      {events.length === 0 ? (
        <p><i className="fa-solid fa-calendar-xmark" style={{ marginRight: '0.3rem' }}></i>No events yet. Check back soon!</p>
      ) : (
        <div className="grid-2">
          {events.map((event) => (
            <div key={event.id} className="card">
              <h3>{event.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#2563eb', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem', color: '#00A0DC' }}></i>{new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {event.location && (
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>{event.location}</p>
              )}
              {event.description && <p>{event.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
