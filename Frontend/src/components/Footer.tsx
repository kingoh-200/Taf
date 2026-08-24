const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="Teens Aloud Foundation" style={{ height: 30, width: 'auto' }} />
        </div>
        <p>© {new Date().getFullYear()} Teens Aloud Foundation Kenya. All rights reserved.</p>
        <p style={styles.subtext}><i className="fa-solid fa-code" style={{ marginRight: '0.3rem' }}></i>Built with React, Node.js & PostgreSQL</p>
      </div>
    </footer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  footer: {
    borderTop: '3px solid #00A0DC',
    padding: '2rem 0',
    marginTop: '4rem',
    textAlign: 'center',
    color: '#64748b',
    background: '#f0f9fc',
  },
  inner: {
    width: '100%',
    padding: '0 2rem',
    margin: '0 auto',
  },
  subtext: {
    fontSize: '0.85rem',
    marginTop: '0.3rem',
  },
};

export default Footer;
