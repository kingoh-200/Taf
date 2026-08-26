import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ministries = [
  {
    id: 'love-fellowship',
    title: 'Love Fellowship',
    icon: 'fa-heart',
    color: '#ef4444',
    description: 'Everything starts from this sub-ministry which seeks to bring young people together to regularly meet and spur themselves unto love and good works.',
    details: 'Wherever young people are found — whether in communal settlements, schools, universities, or offices — Love Fellowships are located. All Teens Aloud members belong to a Love Fellowship, making it the heartbeat of our community.',
  },
  {
    id: 'camp-vista',
    title: 'Camp Vista',
    icon: 'fa-campground',
    color: '#16a34a',
    description: 'Camps are a powerful means of re-igniting passions, building strong social networks, and challenging worldviews.',
    details: 'Camp Vista builds and organizes camps for young people across the world with the aim of creating an atmosphere of change through interaction — interaction with the Word of God and with other friends.',
  },
  {
    id: 'sermon-on-the-sofa',
    title: 'Sermon On The Sofa',
    icon: 'fa-couch',
    color: '#8b5cf6',
    description: 'A unique entertainment package in Secondary Schools — hilarious, edifying, and educational evangelistic events.',
    details: 'Developed in 2007, Sermon on the Sofa is a mixed-bag evangelistic event intended to reach teens through a modern, relevant, and entertaining format. Starting from Ghana in Achimota School, it has since spread to schools across multiple countries.',
  },
  {
    id: 'sportstronic',
    title: 'Sportstronic',
    icon: 'fa-futbol',
    color: '#f59e0b',
    description: 'Reaching young people through sports, games, and experiential learning methods.',
    details: 'Sportstronic believes in harnessing the abundant energies of young people through sports and games. It uses athletics and team-building activities as a platform for mentorship, discipleship, and community building.',
  },
];

const Ministries = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  return (
    <div className="page">
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          <i className="fa-solid fa-church" style={{ marginRight: '0.5rem' }}></i>
          Our Ministries
        </h1>
        <p style={styles.heroSubtitle}>
          We are a Non-Denominational Christian fellowship with the vision to challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.
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
        <h2 style={styles.ctaTitle}>Want to be part of what God is doing?</h2>
        <p style={styles.ctaText}>
          Whether you're a teen, young adult, or someone who believes in the potential of young people — there's a place for you here.
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
