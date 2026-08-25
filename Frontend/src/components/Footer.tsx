import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Mountain/forest scene illustration */}
      <div style={styles.scene}>
        <svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMax slice" style={styles.svg}>
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
          <rect width="1200" height="280" fill="url(#skyGrad)" />

          {/* Far mountains */}
          <polygon points="0,180 80,120 180,150 280,90 400,130 500,80 600,110 700,70 800,100 900,60 1000,90 1100,75 1200,100 1200,280 0,280" fill="url(#mountain1)" opacity="0.7" />

          {/* Mid mountains */}
          <polygon points="0,200 100,160 200,180 320,130 440,170 560,120 680,155 780,115 880,145 1000,110 1100,140 1200,125 1200,280 0,280" fill="url(#mountain2)" opacity="0.85" />

          {/* Birds */}
          <g fill="none" stroke="#4a8a9a" strokeWidth="1.2" opacity="0.6">
            <path d="M620,95 Q625,88 630,95" />
            <path d="M640,85 Q645,78 650,85" />
            <path d="M660,92 Q664,86 668,92" />
            <path d="M680,80 Q684,74 688,80" />
            <path d="M700,88 Q703,83 706,88" />
          </g>

          {/* Fire lookout tower */}
          <g fill="none" stroke="#2a5a3a" strokeWidth="2">
            <line x1="590" y1="105" x2="580" y2="175" />
            <line x1="610" y1="105" x2="620" y2="175" />
            <line x1="585" y1="130" x2="615" y2="150" />
            <line x1="615" y1="130" x2="585" y2="150" />
            <line x1="583" y1="155" x2="617" y2="165" />
            <rect x="582" y="100" width="36" height="8" fill="#2a5a3a" rx="1" />
            <rect x="586" y="82" width="28" height="18" fill="#245030" rx="1" />
            <polygon points="583,82 600,70 617,82" fill="#2a5a3a" />
            <rect x="590" y="86" width="6" height="5" fill="#4a8a6a" rx="0.5" />
            <rect x="600" y="86" width="6" height="5" fill="#4a8a6a" rx="0.5" />
            <rect x="596" y="92" width="8" height="8" fill="#4a8a6a" rx="0.5" />
          </g>

          {/* Tree line (layer 1 - back) */}
          <g fill="url(#trees1)">
            {[50,90,130,170,210,250,300,350,400,450,500,540,660,700,740,780,820,870,920,960,1010,1060,1110,1150].map((x, i) => {
              const h = 30 + (i % 5) * 8;
              const w = 12 + (i % 3) * 4;
              return <polygon key={i} points={`${x},${175 - h} ${x - w},175 ${x + w},175`} />;
            })}
            <rect x="0" y="175" width="1200" height="105" />
          </g>

          {/* Tree line (layer 2 - front) */}
          <g fill="url(#trees2)">
            {[30,75,120,160,200,240,280,330,380,430,470,520,560,640,680,720,760,800,850,900,940,990,1040,1080,1130,1170].map((x, i) => {
              const h = 35 + (i % 4) * 10;
              const w = 14 + (i % 3) * 5;
              return <polygon key={i} points={`${x},${195 - h} ${x - w},195 ${x + w},195`} />;
            })}
            <rect x="0" y="195" width="1200" height="85" />
          </g>

          {/* Ground */}
          <rect x="0" y="210" width="1200" height="70" fill="#123e20" />
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
    minHeight: 160,
  },
  contentSection: {
    background: '#1a4a3a',
    padding: '2rem 0 1.5rem',
  },
  contentInner: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    gap: '3rem',
    flexWrap: 'wrap' as const,
  },
  linksGrid: {
    display: 'flex',
    gap: '3rem',
    flex: 2,
    minWidth: 280,
  },
  linkTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.8rem',
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
    fontSize: '0.9rem',
    textDecoration: 'none',
    padding: '0.25rem 0',
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
    width: 40,
    height: 40,
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
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: '0.6rem',
  },
  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#b8dcd0',
    marginBottom: '0.3rem',
  },
  infoIcon: {
    fontSize: '0.8rem',
    color: '#5ab89a',
    width: 14,
    textAlign: 'center' as const,
  },
  bottomBar: {
    borderTop: '1px solid #2a6a50',
    padding: '1rem 0',
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
