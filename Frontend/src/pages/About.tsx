import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="page">
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          <i className="fa-solid fa-users" style={{ marginRight: '0.5rem' }}></i>
          About Teens Aloud Foundation
        </h1>
        <p style={styles.heroSubtitle}>
          Eternal interest in teens everywhere
        </p>
      </section>

      {/* Welcome */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Who We Are</h2>
        <p style={styles.body}>
          Teens Aloud Foundation (TAF) is a Non-Denominational, Inter-Denominational Christian youth group founded in 2005 by Rev. KK Baidoo. We believe deeply in the potential of every young person, especially teenagers, and have chosen to invest in them through various evangelistic and discipleship means.
        </p>
        <p style={styles.body}>
          What started in Ghana has grown into a global movement spanning multiple countries across Africa, Europe, and North America. Our community is built on love, accountability, and a shared passion for Jesus Christ.
        </p>
      </section>

      {/* Mission & Vision */}
      <section style={styles.mvGrid}>
        <div className="card" style={styles.mvCard}>
          <div style={{ ...styles.mvIcon, color: 'var(--primary)' }}>
            <i className="fa-solid fa-bullseye"></i>
          </div>
          <h3 style={styles.mvTitle}>Our Mission</h3>
          <p style={styles.mvText}>
            To challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ through evangelism, discipleship, and community.
          </p>
        </div>
        <div className="card" style={styles.mvCard}>
          <div style={{ ...styles.mvIcon, color: 'var(--accent)' }}>
            <i className="fa-solid fa-eye"></i>
          </div>
          <h3 style={styles.mvTitle}>Our Vision</h3>
          <p style={styles.mvText}>
            To raise a generation of young people who are grounded in faith, equipped with purpose, and empowered to impact their world for Christ.
          </p>
        </div>
      </section>

      {/* Core Values */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What We Believe</h2>
        <div style={styles.valuesGrid}>
          {[
            { icon: 'fa-cross', title: 'Christ-Centered', desc: 'Everything we do is rooted in the Word of God and the love of Jesus.' },
            { icon: 'fa-handshake', title: 'Community', desc: 'We believe in the power of fellowship — walking together in faith.' },
            { icon: 'fa-star', title: 'Purpose', desc: 'Every young person has a God-given gift waiting to be unlocked.' },
            { icon: 'fa-globe', title: 'Global Reach', desc: 'Our vision crosses borders — from Ghana to the world.' },
            { icon: 'fa-seedling', title: 'Growth', desc: 'We invest in spiritual, emotional, and personal development.' },
            { icon: 'fa-heart', title: 'Love', desc: 'Love Fellowship is the heartbeat of everything we do.' },
          ].map((v, i) => (
            <div key={i} style={styles.valueItem}>
              <i className={`fa-solid ${v.icon}`} style={{ color: 'var(--primary)', fontSize: '1.2rem', width: 28, textAlign: 'center' }}></i>
              <div>
                <h4 style={styles.valueTitle}>{v.title}</h4>
                <p style={styles.valueDesc}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Leadership</h2>
        <div className="card" style={styles.leaderCard}>
          <div style={styles.leaderAvatar}>
            <i className="fa-solid fa-user-pastor" style={{ fontSize: '2rem', color: '#fff' }}></i>
          </div>
          <div>
            <h3 style={styles.leaderName}>Rev. KK Baidoo</h3>
            <p style={styles.leaderRole}>Founder & Global Executive Director</p>
            <p style={styles.leaderBio}>
              A passionate shepherd of young people, Rev. KK Baidoo founded Teens Aloud Foundation in 2005 with a heart to see teens discover their purpose in God. He continues to lead the global movement with vision, wisdom, and an unwavering love for the next generation.
            </p>
          </div>
        </div>
      </section>

      {/* Countries */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Where We Are</h2>
        <div style={styles.countriesGrid}>
          {['Ghana', 'Nigeria', 'South Africa', 'Kenya', 'UK', 'Canada', 'France', 'Eswatini'].map((country) => (
            <div key={country} style={styles.countryChip}>
              <i className="fa-solid fa-location-dot" style={{ fontSize: '0.8rem' }}></i>
              {country}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.cta}>
        <h2 style={styles.ctaTitle}>Seize the Moment!!!</h2>
        <p style={styles.ctaText}>
          We hope you will draw closer to God and be inspired to partner with us. Feel free to connect with us — we'd love to hear from you.
        </p>
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn">
            <i className="fa-solid fa-user-plus" style={{ marginRight: '0.4rem' }}></i>Join TAF
          </Link>
          <Link to="/ministries" className="btn btn-secondary">
            <i className="fa-solid fa-church" style={{ marginRight: '0.4rem' }}></i>Our Ministries
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
    marginBottom: '0.4rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--primary)',
    fontWeight: 500,
    fontStyle: 'italic',
  },
  section: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    marginBottom: '0.8rem',
    paddingBottom: '0.4rem',
    borderBottom: '2px solid var(--primary)',
  },
  body: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    lineHeight: 1.7,
    marginBottom: '0.8rem',
  },
  mvGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))',
    gap: '1.2rem',
    marginTop: '2rem',
  },
  mvCard: {
    textAlign: 'center',
    padding: '2rem 1.5rem',
  },
  mvIcon: {
    fontSize: '2rem',
    marginBottom: '0.8rem',
  },
  mvTitle: {
    fontSize: '1.1rem',
    marginBottom: '0.5rem',
  },
  mvText: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    lineHeight: 1.6,
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
    gap: '0.8rem',
  },
  valueItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.8rem',
    padding: '0.8rem',
    borderRadius: 8,
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
  },
  valueTitle: {
    fontSize: '0.9rem',
    marginBottom: '0.2rem',
  },
  valueDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    margin: 0,
    lineHeight: 1.4,
  },
  leaderCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.2rem',
    padding: '1.5rem',
  },
  leaderAvatar: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A0DC, #F7941D)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  leaderName: {
    fontSize: '1.1rem',
    marginBottom: '0.2rem',
  },
  leaderRole: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: 500,
    marginBottom: '0.5rem',
  },
  leaderBio: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    lineHeight: 1.6,
  },
  countriesGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  countryChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.8rem',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 500,
    background: 'var(--bg-alt)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
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

export default About;
