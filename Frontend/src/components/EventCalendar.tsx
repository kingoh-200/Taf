import { useState } from 'react';
import type { Event } from '../api/types';

interface Props {
  events: Event[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EventCalendar = ({ events }: Props) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  // Map events by date string
  const eventsByDate: Record<string, Event[]> = {};
  events.forEach((event) => {
    const dateKey = new Date(event.event_date).toISOString().split('T')[0];
    if (!eventsByDate[dateKey]) eventsByDate[dateKey] = [];
    eventsByDate[dateKey].push(event);
  });

  const cells: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    cells.push({ day, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    cells.push({ day, isCurrentMonth: true, dateStr: d.toISOString().split('T')[0] });
  }

  // Next month days to fill remaining cells
  const remaining = 42 - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day);
    cells.push({ day, isCurrentMonth: false, dateStr: d.toISOString().split('T')[0] });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  return (
    <div className="card" style={{ padding: '1.2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button onClick={prevMonth} style={calStyles.navBtn}>
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{MONTHS[month]} {year}</h3>
          <button onClick={goToday} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' }}>
            Today
          </button>
        </div>
        <button onClick={nextMonth} style={calStyles.navBtn}>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* Day headers */}
      <div className="calendar-grid">
        {DAYS.map((day) => (
          <div key={day} className="calendar-header-cell">{day}</div>
        ))}

        {/* Calendar cells */}
        {cells.map((cell, i) => {
          const isToday = cell.dateStr === today.toISOString().split('T')[0];
          const dayEvents = eventsByDate[cell.dateStr] || [];

          return (
            <div
              key={i}
              className={`calendar-cell${isToday ? ' today' : ''}${!cell.isCurrentMonth ? ' other-month' : ''}`}
            >
              <div className="calendar-day-num">{cell.day}</div>
              {dayEvents.slice(0, 3).map((ev, j) => (
                <div
                  key={j}
                  title={ev.title}
                  style={{
                    fontSize: '0.6rem',
                    padding: '1px 3px',
                    borderRadius: 3,
                    background: 'var(--primary)',
                    color: '#fff',
                    marginBottom: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' as const,
                    cursor: 'pointer',
                  }}
                >
                  {ev.title}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>+{dayEvents.length - 3}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const calStyles: Record<string, React.CSSProperties> = {
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid var(--border)',
    background: 'var(--bg-alt)',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    transition: 'background 0.2s',
  },
};

export default EventCalendar;
