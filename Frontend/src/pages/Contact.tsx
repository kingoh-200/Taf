import { useState, useEffect } from 'react';
import api from '../api/client';

interface ContentRow {
  page_key: string;
  section_key: string;
  title: string | null;
  body: string | null;
  meta: any;
}

const Contact = () => {
  const [content, setContent] = useState<Record<string, ContentRow>>({});
  const [, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/content/contact')
      .then((res) => {
        const map: Record<string, ContentRow> = {};
        res.data.forEach((r: ContentRow) => { map[r.section_key] = r; });
        setContent(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);  // Parse contact info from JSON body
  let info: Record<string, string> = {};
  try {
    info = content.info ? JSON.parse(content.info.body || '{}') : {};
  } catch {
    info = {};
  }

  // Parse office hours from JSON body
  let hours: Record<string, string> = {};
  try {
    hours = content.hours ? JSON.parse(content.hours.body || '{}') : {};
  } catch {
    hours = {};
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending (in production, this would POST to a contact endpoint)
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }, 1500);
  };

  return (
    <div style={s.page}>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>
            <i className="fa-solid fa-envelope" style={{ marginRight: '0.6rem' }}></i>
            {content.hero?.title || 'Contact Us'}
          </h1>
          <p style={s.heroSubtitle}>
            {content.hero?.body || 'We would love to hear from you. Reach out to Teens Aloud Foundation.'}
          </p>
        </div>
      </section>

      <div style={s.container}>
        {/* Info Cards */}
        <div style={s.infoGrid}>
          <div style={s.infoCard}>
            <div style={{ ...s.infoIcon, background: 'rgba(0,160,220,0.15)' }}>
              <i className="fa-solid fa-envelope" style={{ color: 'var(--primary)', fontSize: '1.3rem' }}></i>
            </div>
            <h3 style={s.infoTitle}>Email</h3>
            <p style={s.infoValue}>{info.email || 'info@teensaloud.com'}</p>
          </div>
          <div style={s.infoCard}>
            <div style={{ ...s.infoIcon, background: 'rgba(247,148,29,0.15)' }}>
              <i className="fa-solid fa-phone" style={{ color: 'var(--accent)', fontSize: '1.3rem' }}></i>
            </div>
            <h3 style={s.infoTitle}>Phone</h3>
            <p style={s.infoValue}>{info.phone || '+254 700 000 000'}</p>
          </div>
          <div style={s.infoCard}>
            <div style={{ ...s.infoIcon, background: 'rgba(22,163,74,0.15)' }}>
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--success)', fontSize: '1.3rem' }}></i>
            </div>
            <h3 style={s.infoTitle}>Address</h3>
            <p style={s.infoValue}>{info.address || 'Nairobi, Kenya'}</p>
          </div>
          <div style={s.infoCard}>
            <div style={{ ...s.infoIcon, background: 'rgba(139,92,246,0.15)' }}>
              <i className="fa-solid fa-globe" style={{ color: '#8b5cf6', fontSize: '1.3rem' }}></i>
            </div>
            <h3 style={s.infoTitle}>Website</h3>
            <p style={s.infoValue}>{info.website || 'teensaloud.com'}</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={s.twoCol}>
          {/* Contact Form */}
          <div style={s.formCard}>
            <h2 style={s.sectionTitle}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.5rem' }}></i>
              Send Us a Message
            </h2>
            {sent && (
              <div style={s.successMsg}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: '0.4rem' }}></i>
                Message sent successfully! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.formRow}>
                <div style={s.formGroup}>
                  <label style={s.label}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your name"
                    required
                    style={s.input}
                  />
                </div>
                <div style={s.formGroup}>
                  <label style={s.label}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                    style={s.input}
                  />
                </div>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                  style={s.input}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here..."
                  required
                  rows={5}
                  style={{ ...s.input, resize: 'vertical', minHeight: 120 }}
                />
              </div>
              <button type="submit" disabled={sending} style={s.submitBtn}>
                {sending ? (
                  <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.4rem' }}></i>Sending...</>
                ) : (
                  <><i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }}></i>Send Message</>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div style={s.sidebar}>
            {/* Office Hours */}
            <div style={s.sideCard}>
              <h3 style={s.sideTitle}>
                <i className="fa-solid fa-clock" style={{ marginRight: '0.4rem' }}></i>
                {content.hours?.title || 'Office Hours'}
              </h3>
              <div style={s.hoursList}>
                <div style={s.hoursRow}>
                  <span style={s.hoursDay}>{hours.weekdays || 'Monday - Friday'}</span>
                  <span style={s.hoursTime}>{hours.weekdayTime || '8:00 AM - 5:00 PM'}</span>
                </div>
                <div style={s.hoursRow}>
                  <span style={s.hoursDay}>{hours.saturday || 'Saturday'}</span>
                  <span style={s.hoursTime}>{hours.saturdayTime || '9:00 AM - 1:00 PM'}</span>
                </div>
                <div style={s.hoursRow}>
                  <span style={s.hoursDay}>{hours.sunday || 'Sunday'}</span>
                  <span style={s.hoursTime}>{hours.sundayTime || 'Closed'}</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div style={s.sideCard}>
              <h3 style={s.sideTitle}>
                <i className="fa-solid fa-share-nodes" style={{ marginRight: '0.4rem' }}></i>
                Follow Us
              </h3>
              <div style={s.socialGrid}>
                {info.facebook && (
                  <a href={info.facebook} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                    <i className="fa-brands fa-facebook-f" style={{ fontSize: '1.2rem' }}></i>
                  </a>
                )}
                {info.twitter && (
                  <a href={info.twitter} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                    <i className="fa-brands fa-x-twitter" style={{ fontSize: '1.2rem' }}></i>
                  </a>
                )}
                {info.instagram && (
                  <a href={info.instagram} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                    <i className="fa-brands fa-instagram" style={{ fontSize: '1.2rem' }}></i>
                  </a>
                )}
                {info.youtube && (
                  <a href={info.youtube} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                    <i className="fa-brands fa-youtube" style={{ fontSize: '1.2rem' }}></i>
                  </a>
                )}
                {!info.facebook && !info.twitter && !info.instagram && !info.youtube && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No social links configured yet.</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div style={s.sideCard}>
              <h3 style={s.sideTitle}>
                <i className="fa-solid fa-link" style={{ marginRight: '0.4rem' }}></i>
                Quick Links
              </h3>
              <div style={s.quickLinks}>
                <a href="/about" style={s.quickLink}><i className="fa-solid fa-info-circle" style={{ marginRight: '0.4rem' }}></i>About Us</a>
                <a href="/ministries" style={s.quickLink}><i className="fa-solid fa-church" style={{ marginRight: '0.4rem' }}></i>Ministries</a>
                <a href="/events" style={s.quickLink}><i className="fa-solid fa-calendar" style={{ marginRight: '0.4rem' }}></i>Events</a>
                <a href="/gallery" style={s.quickLink}><i className="fa-solid fa-images" style={{ marginRight: '0.4rem' }}></i>Gallery</a>
                <a href="/members" style={s.quickLink}><i className="fa-solid fa-users" style={{ marginRight: '0.4rem' }}></i>Members</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh' },
  hero: {
    background: 'var(--hero-bg, linear-gradient(135deg, #f0f7ff, #e8f4fd, #fff7ed))',
    padding: '3rem 1.5rem 2.5rem',
    textAlign: 'center',
  },
  heroInner: { maxWidth: 700, margin: '0 auto' },
  heroTitle: {
    fontSize: '2.2rem', fontWeight: 800, color: 'var(--text)',
    margin: '0 0 0.5rem', letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: '1.05rem', color: 'var(--text-light)',
    margin: 0, lineHeight: 1.6,
  },
  container: { maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 3rem' },
  infoGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem', marginBottom: '2rem',
  },
  infoCard: {
    background: 'var(--card-bg, #fff)', borderRadius: 14, padding: '1.5rem',
    textAlign: 'center', border: '1px solid var(--border)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  infoIcon: {
    width: 52, height: 52, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 0.8rem',
  },
  infoTitle: { fontSize: '1rem', fontWeight: 700, color: 'var(--text)', margin: '0 0 0.3rem' },
  infoValue: { fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 },
  twoCol: {
    display: 'grid', gridTemplateColumns: '1fr 380px',
    gap: '1.5rem', alignItems: 'start',
  },
  formCard: {
    background: 'var(--card-bg, #fff)', borderRadius: 16, padding: '1.8rem',
    border: '1px solid var(--border)',
  },
  sectionTitle: {
    fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)',
    margin: '0 0 1.2rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' },
  input: {
    padding: '0.65rem 0.85rem', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--input-bg)',
    color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    padding: '0.75rem', borderRadius: 10, border: 'none',
    background: 'var(--primary)', color: '#fff',
    fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  successMsg: {
    padding: '0.7rem 1rem', borderRadius: 10,
    background: 'rgba(22,163,74,0.1)', color: 'var(--success, #16a34a)',
    fontSize: '0.9rem', marginBottom: '1rem',
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  sideCard: {
    background: 'var(--card-bg, #fff)', borderRadius: 14, padding: '1.3rem',
    border: '1px solid var(--border)',
  },
  sideTitle: {
    fontSize: '1rem', fontWeight: 700, color: 'var(--text)',
    margin: '0 0 0.8rem',
  },
  hoursList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  hoursRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.5rem 0', borderBottom: '1px solid var(--border)',
  },
  hoursDay: { fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 },
  hoursTime: { fontSize: '0.85rem', color: 'var(--text-light)' },
  socialGrid: { display: 'flex', gap: '0.6rem' },
  socialLink: {
    width: 42, height: 42, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-alt)', color: 'var(--text-light)',
    textDecoration: 'none', transition: 'all 0.2s',
    border: '1px solid var(--border)',
  },
  quickLinks: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  quickLink: {
    display: 'flex', alignItems: 'center', padding: '0.5rem 0.6rem',
    borderRadius: 8, color: 'var(--text-light)', textDecoration: 'none',
    fontSize: '0.9rem', transition: 'background 0.2s',
  },
};

export default Contact;
