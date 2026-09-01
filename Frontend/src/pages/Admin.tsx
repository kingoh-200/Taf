import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { Event, Announcement, Member } from '../api/types';

type Tab = 'overview' | 'events' | 'announcements' | 'members' | 'users' | 'subscribers' | 'email' | 'content';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  const token = localStorage.getItem('token');
  if (!token) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
    { key: 'events', label: 'Events', icon: 'fa-calendar-days' },
    { key: 'announcements', label: 'Updates', icon: 'fa-bullhorn' },
    { key: 'members', label: 'Members', icon: 'fa-users' },
    { key: 'users', label: 'Users', icon: 'fa-user-gear' },
    { key: 'subscribers', label: 'Subscribers', icon: 'fa-envelope-open-text' },
    { key: 'email', label: 'Send Email', icon: 'fa-paper-plane' },
    { key: 'content', label: 'Content', icon: 'fa-pen-to-square' },
  ];

  return (
    <div className="page">
      <h1><i className="fa-solid fa-gauge-high" style={{ marginRight: '0.5rem' }}></i>Admin Dashboard</h1>
      <p>Manage your foundation from here.</p>

      {/* Tabs */}
      <div style={tabStyles.container}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              ...tabStyles.tab,
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--bg-alt)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-light)',
              borderColor: activeTab === tab.key ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ marginRight: '0.4rem' }}></i>
            <span className="hide-mobile">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewPanel />}
      {activeTab === 'events' && <EventsManager />}
      {activeTab === 'announcements' && <AnnouncementsManager />}
      {activeTab === 'members' && <MembersManager />}
      {activeTab === 'users' && <UsersManager />}
      {activeTab === 'subscribers' && <SubscribersManager />}
      {activeTab === 'email' && <EmailSender />}
      {activeTab === 'content' && <ContentManager />}
    </div>
  );
};

// ===== OVERVIEW PANEL =====
const OverviewPanel = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading stats...</div>;
  if (!stats) return <div className="alert alert-error">Failed to load stats.</div>;

  const cards = [
    { label: 'Total Users', value: stats.users, icon: 'fa-users', color: '#00A0DC' },
    { label: 'Admins', value: stats.admins, icon: 'fa-crown', color: '#F7941D' },
    { label: 'Events', value: stats.events, icon: 'fa-calendar-days', color: '#16a34a' },
    { label: 'Announcements', value: stats.announcements, icon: 'fa-bullhorn', color: '#7c3aed' },
    { label: 'Gallery Items', value: stats.gallery, icon: 'fa-images', color: '#ec4899' },
    { label: 'Subscribers', value: stats.subscribers, icon: 'fa-envelope-open-text', color: '#06b6d4' },
    { label: 'New (7 days)', value: stats.recentUsers, icon: 'fa-user-plus', color: '#f59e0b' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.8rem' }}>
        {cards.map((card) => (
          <div key={card.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <i className={`fa-solid ${card.icon}`} style={{ fontSize: '1.5rem', color: card.color, marginBottom: '0.5rem', display: 'block' }}></i>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>{card.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== EVENTS MANAGER =====
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
              {new Date(event.event_date).toLocaleString()} • {event.location || 'No location'}
            </p>
          </div>
          <button onClick={() => handleDelete(event.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Delete</button>
        </div>
      ))}
    </div>
  );
};

// ===== ANNOUNCEMENTS MANAGER =====
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

  const handlePin = async (id: number, isPinned: boolean) => {
    await api.put(`/admin/announcements/${id}/pin`, { is_pinned: !isPinned });
    load();
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
        <div key={item.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4>{item.is_pinned ? <i className="fa-solid fa-thumbtack" style={{ marginRight: '0.3rem', color: 'var(--accent)' }}></i> : ''}{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{item.content.slice(0, 100)}...</p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => handlePin(item.id, !!item.is_pinned)} style={{ ...deleteBtnStyle, background: item.is_pinned ? '#fef3c7' : 'var(--bg-alt)', color: item.is_pinned ? '#92400e' : 'var(--text-light)' }} title={item.is_pinned ? 'Unpin' : 'Pin'}>
                <i className="fa-solid fa-thumbtack"></i>
              </button>
              <button onClick={() => handleDelete(item.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== MEMBERS MANAGER =====
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{member.role || 'Member'}</p>
          </div>
          <button onClick={() => handleDelete(member.id)} style={deleteBtnStyle}><i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Delete</button>
        </div>
      ))}
    </div>
  );
};

// ===== USERS MANAGER =====
const UsersManager = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id: number, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    load();
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    await api.put(`/admin/users/${id}/status`, { is_active: !isActive });
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this user? This cannot be undone.')) {
      await api.delete(`/admin/users/${id}`);
      load();
    }
  };

  if (loading) return <div className="loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading users...</div>;

  return (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
        <i className="fa-solid fa-info-circle" style={{ marginRight: '0.3rem' }}></i>
        Manage user accounts, roles, and access.
      </p>

      {users.map((user) => (
        <div key={user.id} className="card" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h4 style={{ margin: 0 }}>
                {user.name || user.username}
                {user.role === 'admin' && <i className="fa-solid fa-crown" style={{ marginLeft: '0.4rem', color: 'var(--accent)', fontSize: '0.8rem' }}></i>}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '0.2rem 0 0' }}>
                @{user.username} • {user.email || 'No email'} • Joined {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.8rem' }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => handleToggleActive(user.id, user.is_active)}
                style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: 'none', background: user.is_active ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: user.is_active ? 'var(--success)' : 'var(--error)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                <i className={`fa-solid ${user.is_active ? 'fa-user-check' : 'fa-user-xmark'}`} style={{ marginRight: '0.2rem' }}></i>
                {user.is_active ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => handleDelete(user.id)} style={deleteBtnStyle}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ===== SUBSCRIBERS MANAGER =====
const SubscribersManager = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/admin/subscribers')
      .then((res) => setSubscribers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail.trim()) return;
    setAdding(true);
    try {
      await api.post('/admin/subscribers', { email: addEmail.trim(), name: addName.trim() || undefined });
      setAddEmail('');
      setAddName('');
      load();
    } catch {}
    setAdding(false);
  };

  const handleRemove = async (id: number) => {
    if (confirm('Remove this subscriber?')) {
      await api.delete(`/admin/subscribers/${id}`);
      load();
    }
  };

  if (loading) return <div className="loading"><i className="fa-solid fa-spinner fa-spin"></i> Loading subscribers...</div>;

  const activeSubs = subscribers.filter((s) => s.is_active);

  return (
    <div>
      {/* Add subscriber form */}
      <form onSubmit={handleAdd} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.8rem' }}><i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Add Subscriber</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input type="email" placeholder="Email address" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} required style={{ flex: 1, minWidth: 200, padding: '0.55rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
          <input placeholder="Name (optional)" value={addName} onChange={(e) => setAddName(e.target.value)} style={{ flex: 1, minWidth: 150, padding: '0.55rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
          <button type="submit" className="btn" disabled={adding || !addEmail.trim()} style={{ whiteSpace: 'nowrap' }}>
            {adding ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Add</>}
          </button>
        </div>
      </form>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fa-solid fa-chart-bar" style={{ color: 'var(--primary)' }}></i>
          <span style={{ fontWeight: 600 }}>{activeSubs.length}</span>
          <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>active subscriber(s)</span>
        </div>
      </div>

      {activeSubs.length === 0 ? (
        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
          <i className="fa-solid fa-envelope-open" style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}></i>
          No subscribers yet. Add one above or wait for sign-ups on the home page.
        </p>
      ) : (
        activeSubs.map((sub) => (
          <div key={sub.id} className="card" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 500 }}>
                <i className="fa-solid fa-envelope" style={{ marginRight: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem' }}></i>
                {sub.email}
              </div>
              {sub.name && <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{sub.name}</div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Subscribed {new Date(sub.created_at).toLocaleDateString()}</div>
            </div>
            <button onClick={() => handleRemove(sub.id)} style={deleteBtnStyle}>
              <i className="fa-solid fa-user-minus" style={{ marginRight: '0.2rem' }}></i>Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
};

// ===== EMAIL SENDER =====
const EmailSender = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'all' | 'subscribers' | 'members'>('all');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ message: string; recipients: string[] } | null>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    api.get('/admin/email-logs').then((res) => setLogs(res.data)).catch(() => {});
    api.get('/admin/subscribers').then((res) => {
      setSubscriberCount(res.data.filter((s: any) => s.is_active).length);
    }).catch(() => {});
    api.get('/admin/users').then((res) => {
      setMemberCount(res.data.filter((u: any) => u.email && u.is_active).length);
    }).catch(() => {});
  }, []);

  const recipientCount = target === 'all' ? subscriberCount + memberCount : target === 'subscribers' ? subscriberCount : memberCount;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/admin/send-email', { subject, body, target });
      setResult(res.data);
      setSubject('');
      setBody('');
      // Refresh logs
      api.get('/admin/email-logs').then((r) => setLogs(r.data)).catch(() => {});
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSend} className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }}></i>Compose Email</h3>

        <div className="form-group">
          <label>Send to</label>
          <select value={target} onChange={(e) => setTarget(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}>
            <option value="all">Everyone (Subscribers + Members)</option>
            <option value="subscribers">Newsletter Subscribers only</option>
            <option value="members">Registered Members only</option>
          </select>
          <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-info-circle" style={{ marginRight: '0.3rem' }}></i>
            This email will be sent to <strong style={{ color: recipientCount > 0 ? 'var(--primary)' : 'var(--error)' }}>{recipientCount}</strong> recipient(s)
            {target === 'all' && <span> ({subscriberCount} subscribers + {memberCount} members)</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Subject</label>
          <input placeholder="Email subject..." value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Body</label>
          <textarea
            placeholder="Write your email content here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            style={{ minHeight: 150 }}
          />
        </div>

        {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }}></i>{error}</div>}
        {result && (
          <div className="alert alert-success">
            <i className="fa-solid fa-check-circle" style={{ marginRight: '0.4rem' }}></i>
            {result.message}
            {result.recipients.length > 0 && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                <strong>To:</strong> {result.recipients.join(', ')}
              </div>
            )}
          </div>
        )}

        <button type="submit" className="btn" disabled={sending || !subject.trim() || !body.trim()}>
          {sending ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Sending...</> : <><i className="fa-solid fa-paper-plane" style={{ marginRight: '0.3rem' }}></i>Send Email</>}
        </button>
      </form>

      {/* Email History */}
      {logs.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '0.8rem' }}><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '0.4rem' }}></i>Recent Emails</h3>
          {logs.map((log) => (
            <div key={log.id} className="card" style={{ marginBottom: '0.5rem', padding: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{log.subject}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    Sent by {log.sender_name || 'Admin'} • {log.recipient_count} recipient(s) • {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 12, background: log.status === 'sent' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)', color: log.status === 'sent' ? 'var(--success)' : 'var(--error)' }}>
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const tabStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '0.4rem',
    marginBottom: '1.5rem',
    marginTop: '1rem',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    paddingBottom: '0.25rem',
  },
  tab: {
    padding: '0.5rem 0.8rem',
    border: '1px solid var(--border)',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
    transition: 'all 0.2s',
  },
};

const deleteBtnStyle: React.CSSProperties = {
  padding: '0.4rem 0.6rem',
  background: 'rgba(220,38,38,0.08)',
  color: 'var(--error)',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.8rem',
};

// ===== CONTENT MANAGER =====
const ContentManager = () => {
  const [content, setContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activePage, setActivePage] = useState('contact');
  const [editedContent, setEditedContent] = useState<Record<string, { title: string; body: string }>>({});
  const [saveMsg, setSaveMsg] = useState('');

  const pages = [
    { key: 'contact', label: 'Contact Page', icon: 'fa-envelope' },
    { key: 'home', label: 'Home Page', icon: 'fa-house' },
    { key: 'about', label: 'About Page', icon: 'fa-info-circle' },
  ];

  const load = () => {
    setLoading(true);
    api.get('/content')
      .then((res) => setContent(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const map: Record<string, { title: string; body: string }> = {};
    content
      .filter((c) => c.page_key === activePage)
      .forEach((c) => {
        map[c.section_key] = {
          title: c.title || '',
          body: c.body || '',
        };
      });
    setEditedContent(map);
  }, [content, activePage]);

  const updateField = (sectionKey: string, field: 'title' | 'body', value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value },
    }));
  };

  const addSection = () => {
    const key = prompt("Section key (hero, info, hours). No spaces, lowercase.");
    if (!key || editedContent[key]) return;
    setEditedContent((prev) => ({
      ...prev,
      [key]: { title: '', body: '' },
    }));
  };

  const removeSection = (key: string) => {
    if (!confirm(`Remove section "${key}"?`)) return;
    setEditedContent((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const sections = Object.entries(editedContent).map(([section_key, data]) => ({
        section_key,
        title: data.title,
        body: data.body,
      }));
      const res = await api.put(`/content/${activePage}`, { sections });
      setContent(res.data);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Failed to save.');
    }
    setSaving(false);
  };

  const sectionLabels: Record<string, string> = {
    hero: 'Hero / Header',
    info: 'Contact Information',
    hours: 'Office Hours',
    mission: 'Mission Statement',
    vision: 'Vision Statement',
  };

  // Specialized fields for contact page
  const contactFields = [
    { key: 'email', label: 'Email Address', icon: 'fa-envelope', placeholder: 'info@teensaloud.com' },
    { key: 'phone', label: 'Phone Number', icon: 'fa-phone', placeholder: '+254 700 000 000' },
    { key: 'address', label: 'Address', icon: 'fa-location-dot', placeholder: 'Nairobi, Kenya' },
    { key: 'website', label: 'Website', icon: 'fa-globe', placeholder: 'teensaloud.com' },
    { key: 'facebook', label: 'Facebook URL', icon: 'fa-brands fa-facebook-f', placeholder: 'https://facebook.com/teensaloud' },
    { key: 'twitter', label: 'Twitter/X URL', icon: 'fa-brands fa-x-twitter', placeholder: 'https://twitter.com/teensaloud' },
    { key: 'instagram', label: 'Instagram URL', icon: 'fa-brands fa-instagram', placeholder: 'https://instagram.com/teensaloud' },
    { key: 'youtube', label: 'YouTube URL', icon: 'fa-brands fa-youtube', placeholder: 'https://youtube.com/teensaloud' },
  ];

  // Get or initialize contact info data
  const getContactInfo = () => {
    if (!editedContent.info) return {};
    try {
      return JSON.parse(editedContent.info.body || '{}');
    } catch {
      return {};
    }
  };

  const updateContactInfo = (field: string, value: string) => {
    const currentInfo = getContactInfo();
    const newInfo = { ...currentInfo, [field]: value };
    updateField('info', 'body', JSON.stringify(newInfo));
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem' }}>
        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '0.5rem' }}></i>
        Content Manager
      </h2>
      <p style={{ color: 'var(--text-light)', margin: '0 0 1.5rem' }}>
        Edit text content for your public pages. Changes are live immediately.
      </p>

      {/* Page selector */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {pages.map((p) => (
          <button
            key={p.key}
            onClick={() => setActivePage(p.key)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid var(--border)',
              background: activePage === p.key ? 'var(--primary)' : 'var(--bg-alt)',
              color: activePage === p.key ? '#fff' : 'var(--text-light)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
              borderColor: activePage === p.key ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <i className={`fa-solid ${p.icon}`} style={{ marginRight: '0.3rem' }}></i>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading content...</p>
      ) : (
        <>
          {/* Specialized Contact Page Editor */}
          {activePage === 'contact' && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>
                <i className="fa-solid fa-address-card" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {contactFields.map((field) => {
                  const info = getContactInfo();
                  return (
                    <div key={field.key} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '1rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        <i className={`fa-solid ${field.icon}`} style={{ color: 'var(--primary)', fontSize: '1rem' }}></i>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{field.label}</label>
                      </div>
                      <input
                        type="text"
                        value={info[field.key] || ''}
                        onChange={(e) => updateContactInfo(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hero Section (for all pages) */}
          {editedContent.hero && (
            <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '1.2rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    hero
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    — Hero / Header
                  </span>
                </div>
                <button
                  onClick={() => removeSection('hero')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0.4rem' }}
                  title="Remove section"
                >
                  <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Title</label>
                  <input
                    type="text"
                    value={editedContent.hero.title}
                    onChange={(e) => updateField('hero', 'title', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Subtitle</label>
                  <textarea
                    value={editedContent.hero.body}
                    onChange={(e) => updateField('hero', 'body', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Office Hours Section (for contact page) */}
          {activePage === 'contact' && editedContent.hours && (
            <div style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '1.2rem', border: '1px solid var(--border)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    hours
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    — Office Hours
                  </span>
                </div>
                <button
                  onClick={() => removeSection('hours')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0.4rem' }}
                  title="Remove section"
                >
                  <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                {[
                  { key: 'weekdays', label: 'Weekdays', placeholder: 'Monday - Friday' },
                  { key: 'weekdayTime', label: 'Weekday Hours', placeholder: '8:00 AM - 5:00 PM' },
                  { key: 'saturday', label: 'Saturday', placeholder: 'Saturday' },
                  { key: 'saturdayTime', label: 'Saturday Hours', placeholder: '9:00 AM - 1:00 PM' },
                  { key: 'sunday', label: 'Sunday', placeholder: 'Sunday' },
                  { key: 'sundayTime', label: 'Sunday Hours', placeholder: 'Closed' },
                ].map((field) => {
                  let hoursData: Record<string, string> = {};
                  try {
                    hoursData = JSON.parse(editedContent.hours.body || '{}');
                  } catch {}
                  return (
                    <div key={field.key}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>{field.label}</label>
                      <input
                        type="text"
                        value={hoursData[field.key] || ''}
                        onChange={(e) => {
                          const newHours = { ...hoursData, [field.key]: e.target.value };
                          updateField('hours', 'body', JSON.stringify(newHours));
                        }}
                        placeholder={field.placeholder}
                        style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other sections (for non-contact pages or non-specialized sections) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(editedContent)
              .filter(([key]) => {
                // Skip sections we've already rendered specialized UIs for
                if (activePage === 'contact' && ['hero', 'info', 'hours'].includes(key)) return false;
                if (activePage !== 'contact' && key === 'hero') return false; // Hero rendered above
                return true;
              })
              .map(([key, data]) => (
                <div key={key} style={{ background: 'var(--bg-alt)', borderRadius: 12, padding: '1.2rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {key}
                      </span>
                      {sectionLabels[key] && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                          — {sectionLabels[key]}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeSection(key)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem 0.4rem' }}
                      title="Remove section"
                    >
                      <i className="fa-solid fa-trash" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Title</label>
                      <input
                        type="text"
                        value={data.title}
                        onChange={(e) => updateField(key, 'title', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.2rem' }}>Content</label>
                      <textarea
                        value={data.body}
                        onChange={(e) => updateField(key, 'body', e.target.value)}
                        rows={4}
                        style={{ width: '100%', padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem', resize: 'vertical' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.2rem', alignItems: 'center' }}>
            <button onClick={addSection} style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-light)', cursor: 'pointer', fontSize: '0.9rem' }}>
              <i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Add Section
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: saving ? 0.6 : 1 }}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Saving...</> : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: '0.3rem' }}></i>Save Changes</>}
            </button>
            {saveMsg && <span style={{ color: saveMsg === 'Saved!' ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem', fontWeight: 500 }}>{saveMsg}</span>}
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
