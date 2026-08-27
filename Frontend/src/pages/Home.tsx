import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cachedGet } from '../api/client';
import type { Event, Announcement } from '../api/types';

interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  like_count: number;
  created_at: string;
}
import HeroCarousel from '../components/HeroCarousel';
import NewsletterForm from '../components/NewsletterForm';

const MINISTRIES = [
  { icon: 'fa-heart', name: 'Love Fellowship', desc: 'Bringing young people together to spur themselves unto love and good works.', color: '#ef4444' },
  { icon: 'fa-campground', name: 'Camp Vista', desc: 'Camps for re-igniting passions and building strong social networks.', color: '#16a34a' },
  { icon: 'fa-couch', name: 'Sermon On The Sofa', desc: 'Mixed-bag evangelistic events in secondary schools.', color: '#8b5cf6' },
  { icon: 'fa-futbol', name: 'Sportstronic', desc: 'Reaching young people through sports, games, and experiential learning.', color: '#f59e0b' },
];

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [galleryLoading, setGalleryLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    cachedGet('/events')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setEvents(items.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setEventsLoading(false));

    cachedGet('/announcements')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setAnnouncements(items.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setAnnouncementsLoading(false));

    cachedGet('/members')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setMemberCount(items.length);
      })
      .catch(() => {})
      .finally(() => setMembersLoading(false));

    cachedGet('/gallery')
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data as any)?.data || [];
        setGalleryItems(items.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setGalleryLoading(false));
  }, []);

  const initials = user
    ? (user.name || user.username).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div className="page" style={{ margin: 0, padding: 0 }}>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      {user ? (
        /* ——— LOGGED-IN: Compact Welcome + Stats ——— */
        <section style={s.heroLoggedIn}>
          <div style={s.heroInner}>
            <div style={s.welcomeRow}>
              {user.profile_image ? (
                <img src={user.profile_image} alt="" style={s.heroAvatar} />
              ) : (
                <div style={s.heroAvatarFallback}>{initials}</div>
              )}
              <div>
                <h1 style={s.heroTitle}>
                  Welcome back, {user.name || user.username} 👋
                </h1>
                <p style={s.heroSubtitle}>Here's what's happening at Teens Aloud Foundation.</p>
              </div>
            </div>

            {/* Quick stat cards */}
            <div style={s.statGrid}>
              <Link to="/events" style={{ ...s.statCard, borderColor: 'var(--primary)' }}>
                <div style={{ ...s.statIcon, background: 'rgba(0,160,220,0.1)' }}>
                  <i className="fa-solid fa-calendar-days" style={{ color: 'var(--primary)' }}></i>
                </div>
                <span style={s.statNum}>{eventsLoading ? '—' : events.length}</span>
                <span style={s.statLabel}>Upcoming Events</span>
              </Link>
              <Link to="/members" style={{ ...s.statCard, borderColor: '#16a34a' }}>
                <div style={{ ...s.statIcon, background: 'rgba(22,163,74,0.1)' }}>
                  <i className="fa-solid fa-users" style={{ color: '#16a34a' }}></i>
                </div>
                <span style={s.statNum}>{membersLoading ? '—' : memberCount}</span>
                <span style={s.statLabel}>Members</span>
              </Link>
              <Link to="/events" style={{ ...s.statCard, borderColor: 'var(--accent)' }}>
                <div style={{ ...s.statIcon, background: 'rgba(247,148,29,0.1)' }}>
                  <i className="fa-solid fa-bullhorn" style={{ color: 'var(--accent)' }}></i>
                </div>
                <span style={s.statNum}>{announcementsLoading ? '—' : announcements.length}</span>
                <span style={s.statLabel}>Announcements</span>
              </Link>
              <Link to="/ministries" style={{ ...s.statCard, borderColor: '#8b5cf6' }}>
                <div style={{ ...s.statIcon, background: 'rgba(139,92,246,0.1)' }}>
                  <i className="fa-solid fa-church" style={{ color: '#8b5cf6' }}></i>
                </div>
                <span style={s.statNum}>4</span>
                <span style={s.statLabel}>Ministries</span>
              </Link>
            </div>

            {/* Quick actions */}
            <div style={s.quickActions}>
              <Link to="/profile" style={s.actionBtn}>
                <i className="fa-solid fa-user"></i> My Profile
              </Link>
              <Link to="/gallery" style={s.actionBtn}>
                <i className="fa-solid fa-images"></i> Gallery
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={{ ...s.actionBtn, ...s.adminBtn }}>
                  <i className="fa-solid fa-gear"></i> Admin
                </Link>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* ——— LOGGED-OUT: Visual Hero Banner ——— */
        <section style={s.heroLoggedOut}>
          <div style={s.heroBanner}>
            <h1 style={s.bannerTitle}>
              EMPOWERING TEENS.<br />BUILDING FUTURES.
            </h1>
            <p style={s.bannerSubtitle}>
              Creating opportunities, inspiring growth, and building a stronger generation.
            </p>
            <div style={s.bannerActions}>
              <Link to="/ministries" style={s.bannerBtnPrimary}>
                <i className="fa-solid fa-rocket" style={{ marginRight: '0.5rem' }}></i>
                Explore Programs
              </Link>
              <Link to="/register" style={s.bannerBtnSecondary}>
                <i className="fa-solid fa-user-plus" style={{ marginRight: '0.5rem' }}></i>
                Join Us
              </Link>
            </div>
          </div>
          <HeroCarousel />
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR (logged-out)
          ═══════════════════════════════════════════════════════════ */}
      {!user && (
        <section style={s.statsBar}>
          <div style={s.statItem}>
            <span style={s.statBarNum}>{membersLoading ? '—' : memberCount}</span>
            <span style={s.statBarLabel}>MEMBERS</span>
          </div>
          <div style={s.statDivider}></div>
          <div style={s.statItem}>
            <span style={s.statBarNum}>{eventsLoading ? '—' : events.length}</span>
            <span style={s.statBarLabel}>EVENTS</span>
          </div>
          <div style={s.statDivider}></div>
          <div style={s.statItem}>
            <span style={s.statBarNum}>{announcementsLoading ? '—' : announcements.length}</span>
            <span style={s.statBarLabel}>UPDATES</span>
          </div>
          <div style={s.statDivider}></div>
          <div style={s.statItem}>
            <span style={s.statBarNum}>4</span>
            <span style={s.statBarLabel}>MINISTRIES</span>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LATEST ANNOUNCEMENTS
          ═══════════════════════════════════════════════════════════ */}
      {!announcementsLoading && announcements.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHead}>
            <div>
              <h2 style={s.sectionTitle}>
                <i className="fa-solid fa-bullhorn" style={{ marginRight: '0.5rem', color: 'var(--accent)' }}></i>
                Latest Announcements
              </h2>
            </div>
            <Link to="/events" style={s.seeAll}>See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}></i></Link>
          </div>
          <div style={s.announcementGrid}>
            {announcements.map((a) => (
              <div key={a.id} style={s.announcementCard}>
                {a.is_pinned && (
                  <div style={s.pinnedBadge}>
                    <i className="fa-solid fa-thumbtack" style={{ marginRight: '0.2rem' }}></i> Pinned
                  </div>
                )}
                <h3 style={s.announcementTitle}>{a.title}</h3>
                <p style={s.announcementBody}>{a.content}</p>
                <div style={s.announcementDate}>
                  <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }}></i>
                  {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          UPCOMING EVENTS
          ═══════════════════════════════════════════════════════════ */}
      {!eventsLoading && events.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>
              <i className="fa-solid fa-calendar-days" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
              Upcoming Events
            </h2>
            <Link to="/events" style={s.seeAll}>See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}></i></Link>
          </div>
          <div style={s.eventList}>
            {events.map((event) => {
              const d = new Date(event.event_date);
              return (
                <div key={event.id} style={s.eventCard}>
                  <div style={s.eventDateBox}>
                    <span style={s.eventMonth}>{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span style={s.eventDay}>{d.getDate()}</span>
                  </div>
                  <div style={s.eventInfo}>
                    <h3 style={s.eventTitle}>{event.title}</h3>
                    {event.location && (
                      <p style={s.eventMeta}>
                        <i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>
                        {event.location}
                      </p>
                    )}
                    <p style={s.eventMeta}>
                      <i className="fa-regular fa-clock" style={{ marginRight: '0.3rem' }}></i>
                      {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <Link to="/events" style={s.eventLink}>
                    View <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem' }}></i>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          OUR MINISTRIES
          ═══════════════════════════════════════════════════════════ */}
      <section style={s.section}>
        <div style={s.sectionHead}>
          <h2 style={s.sectionTitle}>
            <i className="fa-solid fa-seedling" style={{ marginRight: '0.5rem', color: '#16a34a' }}></i>
            Our Ministries
          </h2>
          <Link to="/ministries" style={s.seeAll}>See all <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}></i></Link>
        </div>
        <div style={s.ministryGrid}>
          {MINISTRIES.map((m) => (
            <Link key={m.name} to="/ministries" style={s.ministryCard}>
              <div style={{ ...s.ministryIcon, background: `${m.color}15` }}>
                <i className={`fa-solid ${m.icon}`} style={{ color: m.color, fontSize: '1.5rem' }}></i>
              </div>
              <h3 style={s.ministryName}>{m.name}</h3>
              <p style={s.ministryDesc}>{m.desc}</p>
              <span style={s.ministryLink}>
                Learn More <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.7rem' }}></i>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ABOUT TEENS ALOUD
          ═══════════════════════════════════════════════════════════ */}
      <section style={s.aboutSection}>
        <div style={s.aboutInner}>
          <div style={s.aboutText}>
            <h2 style={s.aboutTitle}>
              <i className="fa-solid fa-heart" style={{ marginRight: '0.5rem', color: 'var(--accent)' }}></i>
              About Teens Aloud
            </h2>
            <p style={s.aboutDesc}>
              We believe every young person has the potential to make a difference.
              Teens Aloud Foundation is a Non-Denominational Christian fellowship with the vision
              to challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.
            </p>
            <Link to="/about" style={s.aboutLink}>
              Learn More <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.4rem' }}></i>
            </Link>
          </div>
          <div style={s.aboutVisual}>
            <div style={s.aboutIconGrid}>
              <div style={{ ...s.aboutIcon, background: 'rgba(0,160,220,0.1)' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--primary)' }}></i>
              </div>
              <div style={{ ...s.aboutIcon, background: 'rgba(247,148,29,0.1)' }}>
                <i className="fa-solid fa-globe" style={{ color: 'var(--accent)' }}></i>
              </div>
              <div style={{ ...s.aboutIcon, background: 'rgba(22,163,74,0.1)' }}>
                <i className="fa-solid fa-book-open" style={{ color: '#16a34a' }}></i>
              </div>
              <div style={{ ...s.aboutIcon, background: 'rgba(139,92,246,0.1)' }}>
                <i className="fa-solid fa-hand-holding-heart" style={{ color: '#8b5cf6' }}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FROM OUR GALLERY
          ═══════════════════════════════════════════════════════════ */}
      {!galleryLoading && galleryItems.length > 0 && (
        <section style={s.section}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>
              <i className="fa-solid fa-images" style={{ marginRight: '0.5rem', color: 'var(--primary)' }}></i>
              From Our Gallery
            </h2>
            <Link to="/gallery" style={s.seeAll}>View Gallery <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.75rem' }}></i></Link>
          </div>
          <div style={s.galleryGrid}>
            {galleryItems.slice(0, 6).map((item) => (
              <Link key={item.id} to="/gallery" style={s.galleryItem}>
                {item.type === 'video' ? (
                  <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-play" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.5rem' }}></i>
                  </div>
                ) : (
                  <img src={item.thumbnail_url || item.url} alt={item.caption || ''} style={s.galleryImg} loading="lazy" />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          GET INVOLVED CTA
          ═══════════════════════════════════════════════════════════ */}
      {!user && (
        <section style={s.ctaSection}>
          <div style={s.ctaInner}>
            <h2 style={s.ctaTitle}>Get Involved</h2>
            <p style={s.ctaSubtitle}>Become part of Teens Aloud Foundation</p>
            <div style={s.ctaActions}>
              <Link to="/register" style={s.ctaBtnPrimary}>
                <i className="fa-solid fa-user-plus" style={{ marginRight: '0.5rem' }}></i>
                Join Us Today
              </Link>
              <Link to="/about" style={s.ctaBtnSecondary}>
                Learn More
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          NEWSLETTER (logged-out)
          ═══════════════════════════════════════════════════════════ */}
      {!user && (
        <section style={s.newsletterSection}>
          <div style={s.newsletterInner}>
            <i className="fa-solid fa-envelope-open-text" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.8rem' }}></i>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.2rem', color: 'var(--text)' }}>Stay Connected</h2>
            <p style={{ color: 'var(--text-light)', margin: '0 0 1rem', fontSize: '0.9rem' }}>
              Get updates on events, ministries, and community news.
            </p>
            <NewsletterForm />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <i className="fa-solid fa-users" style={{ marginRight: '0.4rem', color: 'var(--primary)' }}></i>
            <strong>Teens Aloud Foundation</strong>
          </div>
          <p style={s.footerCopy}>© {new Date().getFullYear()} Teens Aloud Foundation. All rights reserved.</p>
          <div style={s.footerLinks}>
            <Link to="/about" style={s.footerLink}>About</Link>
            <Link to="/events" style={s.footerLink}>Events</Link>
            <Link to="/ministries" style={s.footerLink}>Ministries</Link>
            <Link to="/gallery" style={s.footerLink}>Gallery</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════ */
const s: Record<string, React.CSSProperties> = {
  /* ─── HERO (Logged In) ─── */
  heroLoggedIn: {
    background: 'linear-gradient(135deg, #0077B6 0%, #00A0DC 100%)',
    padding: '2.5rem 1.5rem 2rem',
  },
  heroInner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  welcomeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  heroAvatar: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  heroAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.4rem',
    fontWeight: 700,
    flexShrink: 0,
    border: '3px solid rgba(255,255,255,0.3)',
  },
  heroTitle: {
    fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
    color: '#fff',
    margin: 0,
    fontWeight: 800,
    letterSpacing: '-0.01em',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    margin: '0.2rem 0 0',
    fontSize: '0.95rem',
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0.8rem',
    marginBottom: '1.2rem',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '1rem 0.8rem',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.2)',
    textDecoration: 'none',
    color: '#fff',
    transition: 'all 0.2s',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 800,
    lineHeight: 1,
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  quickActions: {
    display: 'flex',
    gap: '0.6rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.6rem 1.2rem',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.25)',
    textDecoration: 'none',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  adminBtn: {
    background: 'rgba(247,148,29,0.3)',
    borderColor: 'rgba(247,148,29,0.5)',
  },

  /* ─── HERO (Logged Out) ─── */
  heroLoggedOut: {
    background: 'linear-gradient(135deg, #0077B6 0%, #00A0DC 50%, #F7941D 100%)',
    padding: '3rem 1.5rem 2rem',
    textAlign: 'center',
  },
  heroBanner: {
    maxWidth: 650,
    margin: '0 auto 2rem',
  },
  bannerTitle: {
    fontSize: 'clamp(1.8rem, 6vw, 3rem)',
    fontWeight: 900,
    color: '#fff',
    margin: '0 0 0.8rem',
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    textShadow: '0 2px 20px rgba(0,0,0,0.15)',
  },
  bannerSubtitle: {
    fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
    color: 'rgba(255,255,255,0.9)',
    margin: '0 0 1.5rem',
    lineHeight: 1.5,
  },
  bannerActions: {
    display: 'flex',
    gap: '0.8rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  bannerBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: '#fff',
    color: '#0077B6',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    transition: 'all 0.2s',
  },
  bannerBtnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: 'transparent',
    color: '#fff',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
    border: '2px solid rgba(255,255,255,0.5)',
    transition: 'all 0.2s',
  },

  /* ─── STATS BAR (logged-out) ─── */
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'clamp(1.5rem, 5vw, 3rem)',
    padding: '2rem 1rem',
    background: 'var(--bg-elevated)',
    borderBottom: '1px solid var(--border-light)',
    flexWrap: 'wrap' as const,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.2rem',
  },
  statBarNum: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--primary)',
    lineHeight: 1,
  },
  statBarLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    background: 'var(--border-light)',
  },

  /* ─── SECTIONS ─── */
  section: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '2.5rem 1.5rem',
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.2rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--text)',
    margin: 0,
  },
  seeAll: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 600,
  },

  /* ─── ANNOUNCEMENTS ─── */
  announcementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
    gap: '1rem',
  },
  announcementCard: {
    background: 'var(--bg-elevated)',
    borderRadius: 14,
    padding: '1.2rem',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow)',
    position: 'relative' as const,
  },
  pinnedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--accent)',
    background: 'rgba(247,148,29,0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: 6,
    marginBottom: '0.5rem',
  },
  announcementTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 0.4rem',
  },
  announcementBody: {
    fontSize: '0.88rem',
    color: 'var(--text-light)',
    margin: '0 0 0.6rem',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as any,
    overflow: 'hidden',
  },
  announcementDate: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },

  /* ─── EVENTS ─── */
  eventList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.8rem',
  },
  eventCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.2rem',
    background: 'var(--bg-elevated)',
    borderRadius: 14,
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow)',
  },
  eventDateBox: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    background: 'var(--primary)',
    color: '#fff',
    borderRadius: 10,
    padding: '0.6rem 0.8rem',
    minWidth: 56,
    flexShrink: 0,
  },
  eventMonth: {
    fontSize: '0.65rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    opacity: 0.9,
  },
  eventDay: {
    fontSize: '1.4rem',
    fontWeight: 800,
    lineHeight: 1,
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
  },
  eventTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 0.2rem',
  },
  eventMeta: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    margin: '0.1rem 0',
  },
  eventLink: {
    color: 'var(--primary)',
    fontWeight: 600,
    fontSize: '0.85rem',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },

  /* ─── MINISTRIES ─── */
  ministryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px, 100%), 1fr))',
    gap: '1rem',
  },
  ministryCard: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1.3rem',
    background: 'var(--bg-elevated)',
    borderRadius: 14,
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow)',
    textDecoration: 'none',
    color: 'var(--text)',
    transition: 'all 0.2s',
  },
  ministryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.8rem',
  },
  ministryName: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--text)',
    margin: '0 0 0.3rem',
  },
  ministryDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    margin: '0 0 0.8rem',
    lineHeight: 1.5,
    flex: 1,
  },
  ministryLink: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--primary)',
  },

  /* ─── ABOUT ─── */
  aboutSection: {
    background: 'var(--bg-alt)',
    borderTop: '1px solid var(--border-light)',
    borderBottom: '1px solid var(--border-light)',
  },
  aboutInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '3rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '3rem',
    flexWrap: 'wrap' as const,
  },
  aboutText: {
    flex: '1 1 400px',
  },
  aboutTitle: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 0.8rem',
  },
  aboutDesc: {
    fontSize: '1rem',
    color: 'var(--text-light)',
    lineHeight: 1.7,
    margin: '0 0 1.2rem',
  },
  aboutLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: 'var(--primary)',
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
  },
  aboutVisual: {
    flex: '0 0 auto',
  },
  aboutIconGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.8rem',
  },
  aboutIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },

  /* ─── GALLERY PREVIEW ─── */
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px, 100%), 1fr))',
    gap: '0.6rem',
  },
  galleryItem: {
    position: 'relative' as const,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: '1',
    display: 'block',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border-light)',
  },
  galleryImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  /* ─── CTA ─── */
  ctaSection: {
    background: 'linear-gradient(135deg, #0077B6 0%, #00A0DC 100%)',
    textAlign: 'center',
    padding: '3rem 1.5rem',
  },
  ctaInner: {
    maxWidth: 500,
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 0.4rem',
  },
  ctaSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1rem',
    margin: '0 0 1.5rem',
  },
  ctaActions: {
    display: 'flex',
    gap: '0.8rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  ctaBtnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: '#fff',
    color: '#0077B6',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  ctaBtnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.8rem 1.5rem',
    background: 'transparent',
    color: '#fff',
    borderRadius: 12,
    fontWeight: 700,
    fontSize: '0.95rem',
    textDecoration: 'none',
    border: '2px solid rgba(255,255,255,0.5)',
  },

  /* ─── NEWSLETTER ─── */
  newsletterSection: {
    padding: '2.5rem 1.5rem',
    textAlign: 'center',
    maxWidth: 500,
    margin: '0 auto',
  },
  newsletterInner: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },

  /* ─── FOOTER ─── */
  footer: {
    borderTop: '1px solid var(--border-light)',
    padding: '1.5rem',
    textAlign: 'center',
  },
  footerInner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  footerBrand: {
    fontSize: '0.95rem',
    color: 'var(--text)',
    marginBottom: '0.3rem',
  },
  footerCopy: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: '0 0 0.5rem',
  },
  footerLinks: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  footerLink: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
};

export default Home;
