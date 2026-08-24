import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { Event, Announcement, Member } from '../api/types';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'events' | 'announcements' | 'members'>('events');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const token = localStorage.getItem('token');
  if (!token) return null;

  return (
    <div className="page">
      <h1><i className="fa-solid fa-gauge-high" style={{ marginRight: '0.5rem' }}></i>Admin Dashboard</h1>
      <p>Manage your club's content from here.</p>

      {/* Tabs */}
      <div style={tabStyles.container}>
        {(['events', 'announcements', 'members'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...tabStyles.tab,
              background: activeTab === tab ? '#00A0DC' : '#e2e8f0',
              color: activeTab === tab ? '#fff' : '#475569',
            }}
          >
            <i className={`fa-solid ${tab === 'events' ? 'fa-calendar-days' : tab === 'announcements' ? 'fa-bullhorn' : 'fa-users'}`} style={{ marginRight: '0.4rem' }}></i>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'events' && <EventsManager />}
      {activeTab === 'announcements' && <AnnouncementsManager />}
      {activeTab === 'members' && <MembersManager />}
    </div>
  );
};

// --- Events Manager ---
const EventsManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: '', description: '', event_date: '', location: '' });

  const load = () => api.get('/events').then((res) => setEvents(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/events', form);
    setForm({ title: '', description: '', event_date: '', location: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this event?')) {
      await api.delete(`/events/${id}`);
      load();
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-plus-circle" style={{ marginRight: '0.4rem' }}></i>Add Event</h3>
        <div className="form-group">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
        </div>
        <div className="form-group">
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <button type="submit" className="btn"><i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Create Event</button>
      </form>

      {events.map((event) => (
        <div key={event.id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>{event.title}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {new Date(event.event_date).toLocaleString()} • {event.location || 'No location'}
            </p>
          </div>
          <button onClick={() => handleDelete(event.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Delete</button>
        </div>
      ))}
    </div>
  );
};

// --- Announcements Manager ---
const AnnouncementsManager = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ title: '', content: '' });

  const load = () => api.get('/announcements').then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/announcements', form);
    setForm({ title: '', content: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this announcement?')) {
      await api.delete(`/announcements/${id}`);
      load();
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-plus-circle" style={{ marginRight: '0.4rem' }}></i>Add Announcement</h3>
        <div className="form-group">
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="form-group">
          <textarea placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        </div>
        <button type="submit" className="btn"><i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Create Announcement</button>
      </form>

      {items.map((item) => (
        <div key={item.id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>{item.is_pinned ? <i className="fa-solid fa-thumbtack" style={{ marginRight: '0.3rem', color: '#2563eb' }}></i> : ''}{item.title}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.content.slice(0, 100)}...</p>
          </div>
          <button onClick={() => handleDelete(item.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Delete</button>
        </div>
      ))}
    </div>
  );
};

// --- Members Manager ---
const MembersManager = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [form, setForm] = useState({ name: '', role: '', bio: '' });

  const load = () => api.get('/members').then((res) => setMembers(res.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/members', form);
    setForm({ name: '', role: '', bio: '' });
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this member?')) {
      await api.delete(`/members/${id}`);
      load();
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Add Member</h3>
        <div className="form-group">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <input placeholder="Role (e.g. President)" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </div>
        <div className="form-group">
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <button type="submit" className="btn"><i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Add Member</button>
      </form>

      {members.map((member) => (
        <div key={member.id} className="card" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4>{member.name}</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{member.role || 'Member'}</p>
          </div>
          <button onClick={() => handleDelete(member.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Delete</button>
        </div>
      ))}
    </div>
  );
};

const tabStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    marginTop: '1.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  background: '#fee2e2',
  color: '#dc2626',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.85rem',
};

export default Admin;
