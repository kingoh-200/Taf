import { useState } from 'react';
import type { Event } from '../api/types';
import { EventCardSkeleton } from '../components/Skeleton';
import NewItemsBanner from '../components/NewItemsBanner';
import { useRealtimePolling } from '../hooks/useRealtimePolling';
import EventCalendar from '../components/EventCalendar';

const Events = () => {
  const { data: events, loading, newCount, acceptNew } = useRealtimePolling<Event[]>('/events', [], { interval: 15000 });
  const [view, setView] = useState<'grid' | 'calendar'>('grid');

  if (loading) return (
    <div className="page">
      <h1><i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>Events</h1>
      <p>Check out what we've been up to and what's coming next.</p>
      <div className="grid-2">
        <EventCardSkeleton /><EventCardSkeleton /><EventCardSkeleton /><EventCardSkeleton />
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h1><i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem' }}></i>Events</h1>
          <p style={{ marginBottom: 0 }}>Check out what we've been up to and what's coming next.</p>
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-alt)', borderRadius: 8, padding: '0.2rem', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setView('grid')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              border: 'none',
              background: view === 'grid' ? 'var(--primary)' : 'transparent',
              color: view === 'grid' ? '#fff' : 'var(--text-light)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <i className="fa-solid fa-grip" style={{ marginRight: '0.3rem' }}></i>Grid
          </button>
          <button
            onClick={() => setView('calendar')}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: 6,
              border: 'none',
              background: view === 'calendar' ? 'var(--primary)' : 'transparent',
              color: view === 'calendar' ? '#fff' : 'var(--text-light)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>Calendar
          </button>
        </div>
      </div>

      <div style={{ marginTop: '0.8rem' }}>
        <NewItemsBanner count={newCount} onClick={acceptNew} />
      </div>

      {events.length === 0 ? (
        <p style={{ marginTop: '1rem' }}><i className="fa-solid fa-calendar-xmark" style={{ marginRight: '0.3rem' }}></i>No events yet. Check back soon!</p>
      ) : view === 'calendar' ? (
        <div style={{ marginTop: '1rem' }}>
          <EventCalendar events={events} />
        </div>
      ) : (
        <div className="grid-2" style={{ marginTop: '1rem' }}>
          {events.map((event) => (
            <div key={event.id} className="card">
              <h3>{event.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem', color: 'var(--primary)' }}></i>{new Date(event.event_date).toLocaleDateString('en-US', {
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
