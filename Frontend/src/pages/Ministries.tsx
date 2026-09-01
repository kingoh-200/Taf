import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePageContent, useMinistries } from '../hooks/usePageContent';

const Ministries = () => {
  const [user, setUser] = useState<any>(null);
  const { getTitle, getBody } = usePageContent('ministries');
  const { ministries } = useMinistries();
  
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="page">
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          <i className="fa-solid fa-church" style={{ marginRight: '0.5rem' }}></i>
          {getTitle('hero', 'Our Ministries')}
        </h1>
        <p style={styles.heroSubtitle}>
          {getBody('hero', 'We are a Non-Denominational Christian fellowship with the vision to challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.')}
        </p>
      </section>

      <div style={styles.grid}>
        {ministries.map((m) => (
          <div key={m.id} className="card" style={styles.card}>
            <div style={{ ...styles.iconWrap, background: `${m.color}15`, color: m.color }}>
              <i className={`fa-solid ${m.icon}`}></i>
            </div>
            <h2 style={styles.cardTitle}>{m.title}</h2>
            <p style={styles.cardDesc}>{m.description}</p>
            <p style={styles.cardDetails}>{m.details}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>{getTitle('cta', 'Want to be part of what God is doing?')}</h2>
        <p style={styles.ctaText}>
          {getBody('cta', "Whether you're a teen, young adult, or someone who believes in the potential of young people — there's a place for you here.")}
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/gallery" className="btn">
              <i className="fa-solid fa-images" style={{ marginRight: '0.4rem' }}></i>Gallery
            </Link>
          ) : (
            <Link to="/register" className="btn">
              <i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Join Us Today
            </Link>
          )}
          <Link to="/members" className="btn btn-secondary">
            <i className="fa-solid fa-users" style={{ marginRight: '0.4rem' }}></i>Meet Our Members
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  hero: {
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
    background: 'var(--bg-alt)',
    borderRadius: 12,
    marginTop: '1rem',
    border: '1px solid var(--border)',
  },
  heroTitle: {
    fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
    color: 'var(--text-light)',
    maxWidth: 600,
    margin: '0 auto',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
    gap: '1.2rem',
    marginTop: '2rem',
  },
  card: {
    padding: '1.5rem',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    marginBottom: '0.8rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.4rem',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    marginBottom: '0.5rem',
    lineHeight: 1.5,
  },
  cardDetails: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  cta: {
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
    marginTop: '2rem',
    background: 'var(--bg-alt)',
    borderRadius: 12,
    border: '1px solid var(--border)',
  },
  ctaTitle: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
  },
  ctaText: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    maxWidth: 500,
    margin: '0 auto 1.2rem',
  },
};

export default Ministries;
