import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Mountain/forest scene illustration */}
      <div style={styles.scene}>
        <svg viewBox="0 0 1200 180" preserveAspectRatio="xMidYMax slice" style={styles.svg}>
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5ba3b5" />
              <stop offset="60%" stopColor="#3d8a9e" />
              <stop offset="100%" stopColor="#2d6a7a" />
            </linearGradient>
            <linearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a7a8a" />
              <stop offset="100%" stopColor="#2d6575" />
            </linearGradient>
            <linearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2f6e7e" />
              <stop offset="100%" stopColor="#245a68" />
            </linearGradient>
            <linearGradient id="trees1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e5530" />
              <stop offset="100%" stopColor="#184a28" />
            </linearGradient>
            <linearGradient id="trees2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#174a28" />
              <stop offset="100%" stopColor="#123e20" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width="1200" height="180" fill="url(#skyGrad)" />

          {/* Far mountains */}
          <polygon points="0,110 80,70 180,90 280,50 400,80 500,40 600,65 700,30 800,55 900,25 1000,50 1100,40 1200,55 1200,180 0,180" fill="url(#mountain1)" opacity="0.7" />

          {/* Mid mountains */}
          <polygon points="0,120 100,95 200,110 320,80 440,105 560,75 680,95 780,70 880,90 1000,65 1100,85 1200,75 1200,180 0,180" fill="url(#mountain2)" opacity="0.85" />

          {/* Birds */}
          <g fill="none" stroke="#4a8a9a" strokeWidth="1.2" opacity="0.6">
            <path d="M620,55 Q625,48 630,55" />
            <path d="M640,45 Q645,38 650,45" />
            <path d="M660,52 Q664,46 668,52" />
            <path d="M680,40 Q684,34 688,40" />
            <path d="M700,48 Q703,43 706,48" />
          </g>

          {/* Fire lookout tower */}
          <g fill="none" stroke="#2a5a3a" strokeWidth="1.5">
            <line x1="590" y1="70" x2="583" y2="120" />
            <line x1="610" y1="70" x2="617" y2="120" />
            <line x1="587" y1="88" x2="613" y2="102" />
            <line x1="613" y1="88" x2="587" y2="102" />
            <rect x="584" y="66" width="32" height="5" fill="#2a5a3a" rx="1" />
            <rect x="588" y="54" width="24" height="12" fill="#245030" rx="1" />
            <polygon points="586,54 600,44 614,54" fill="#2a5a3a" />
            <rect x="591" y="57" width="4" height="4" fill="#4a8a6a" rx="0.5" />
            <rect x="599" y="57" width="4" height="4" fill="#4a8a6a" rx="0.5" />
            <rect x="596" y="62" width="8" height="4" fill="#4a8a6a" rx="0.5" />
          </g>

          {/* Tree line (layer 1 - back) */}
          <g fill="url(#trees1)">
            {[50,90,130,170,210,250,300,350,400,450,500,540,660,700,740,780,820,870,920,960,1010,1060,1110,1150].map((x, i) => {
              const h = 18 + (i % 5) * 5;
              const w = 8 + (i % 3) * 3;
              return <polygon key={i} points={`${x},${118 - h} ${x - w},118 ${x + w},118`} />;
            })}
            <rect x="0" y="118" width="1200" height="62" />
          </g>

          {/* Tree line (layer 2 - front) */}
          <g fill="url(#trees2)">
            {[30,75,120,160,200,240,280,330,380,430,470,520,560,640,680,720,760,800,850,900,940,990,1040,1080,1130,1170].map((x, i) => {
              const h = 22 + (i % 4) * 6;
              const w = 10 + (i % 3) * 4;
              return <polygon key={i} points={`${x},${135 - h} ${x - w},135 ${x + w},135`} />;
            })}
            <rect x="0" y="135" width="1200" height="45" />
          </g>

          {/* Ground */}
          <rect x="0" y="145" width="1200" height="35" fill="#123e20" />
        </svg>
      </div>

      {/* Links + Info section */}
      <div style={styles.contentSection}>
        <div style={styles.contentInner}>
          {/* Link columns */}
          <div style={styles.linksGrid}>
            <div>
              <h4 style={styles.linkTitle}>Links</h4>
              <ul style={styles.linkList}>
                <li><Link to="/" style={styles.link}>Home</Link></li>
                <li><Link to="/events" style={styles.link}>Events</Link></li>
                <li><Link to="/gallery" style={styles.link}>Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={styles.linkTitle}>Community</h4>
              <ul style={styles.linkList}>
                <li><Link to="/members" style={styles.link}>Members</Link></li>
                <li><Link to="/register" style={styles.link}>Join Us</Link></li>
                <li><Link to="/profile" style={styles.link}>My Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 style={styles.linkTitle}>Legal</h4>
              <ul style={styles.linkList}>
                <li><span style={styles.link}>Privacy Policy</span></li>
                <li><span style={styles.link}>Terms & Conditions</span></li>
                <li><span style={styles.link}>Code of Conduct</span></li>
              </ul>
            </div>
          </div>

          {/* Social icons */}
          <div style={styles.socialCol}>
            <div style={styles.socialIcons}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} aria-label="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} aria-label="Twitter">
                <i className="fa-brands fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} aria-label="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Company info */}
          <div style={styles.infoCol}>
            <h3 style={styles.brandName}>Teens Aloud Foundation</h3>
            <p style={styles.infoLine}>
              <i className="fa-solid fa-location-dot" style={styles.infoIcon}></i>
              Nairobi, Kenya
            </p>
            <p style={styles.infoLine}>
              <i className="fa-solid fa-phone" style={styles.infoIcon}></i>
              Contact us for more info
            </p>
            <p style={styles.infoLine}>
              <i className="fa-solid fa-envelope" style={styles.infoIcon}></i>
              info@teensaloud.org
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomInner}>
          <div style={styles.bottomLeft}>
            <img src="/logo.png" alt="Teens Aloud" style={{ height: 24, width: 'auto' }} />
          </div>
          <div style={styles.bottomCenter}>
            <span style={styles.bottomLink}>Privacy Policy</span>
            <span style={styles.bottomDot}>·</span>
            <span style={styles.bottomLink}>Terms & Conditions</span>
            <span style={styles.bottomDot}>·</span>
            <span style={styles.bottomLink}>End User License</span>
          </div>
          <div style={styles.bottomRight}>
            <span style={styles.copyright}>© {new Date().getFullYear()} Teens Aloud Foundation Kenya. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  footer: {
    marginTop: '4rem',
    color: '#e8f4f0',
    background: '#1a4a3a',
    transition: 'background 0.3s, color 0.3s',
  },
  scene: {
    width: '100%',
    overflow: 'hidden',
    lineHeight: 0,
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
  },
  contentSection: {
    background: '#1a4a3a',
    padding: '1.2rem 0 1rem',
  },
  contentInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap' as const,
  },
  linksGrid: {
    display: 'flex',
    gap: '3rem',
    flex: 2,
    minWidth: 280,
  },
  linkTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    display: 'block',
    color: '#b8dcd0',
    fontSize: '0.82rem',
    textDecoration: 'none',
    padding: '0.15rem 0',
    transition: 'color 0.2s',
  },
  socialCol: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: '0.2rem',
  },
  socialIcons: {
    display: 'flex',
    gap: '0.8rem',
  },
  socialBtn: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: '2px solid #4a9a7a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#e8f4f0',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  infoCol: {
    flex: 1,
    minWidth: 220,
  },
  brandName: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.4rem',
  },
  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#b8dcd0',
    marginBottom: '0.15rem',
  },
  infoIcon: {
    fontSize: '0.8rem',
    color: '#5ab89a',
    width: 14,
    textAlign: 'center' as const,
  },
  bottomBar: {
    borderTop: '1px solid #2a6a50',
    padding: '0.6rem 0',
    background: '#15402e',
  },
  bottomInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '0.8rem',
  },
  bottomLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  bottomCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  bottomLink: {
    fontSize: '0.8rem',
    color: '#8abfa8',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  bottomDot: {
    color: '#4a8a6a',
  },
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
  },
  copyright: {
    fontSize: '0.8rem',
    color: '#8abfa8',
  },
};

export default Footer;
