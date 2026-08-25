const Gallery = () => {
  return (
    <div className="page">
      <h1>Gallery</h1>
      <p>Photos and memories from our club activities.</p>

      <div style={styles.placeholder}>
        <div style={styles.iconRow}>
          <i className="fa-solid fa-camera" style={styles.icon}></i>
          <i className="fa-solid fa-film" style={styles.icon}></i>
          <i className="fa-solid fa-image" style={styles.icon}></i>
        </div>
        <h3 style={{ marginTop: '1rem', color: 'var(--text)' }}><i className="fa-solid fa-images" style={{ marginRight: '0.5rem' }}></i>Gallery coming soon!</h3>
        <p style={{ color: 'var(--text-light)', maxWidth: 400, margin: '0.5rem auto 0' }}>
          We're working on adding photos from our events and activities.
          Check back soon to see memories from the club!
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  placeholder: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'var(--bg-alt)',
    borderRadius: 12,
    border: '2px dashed var(--border)',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  icon: {
    fontSize: '2.5rem',
    opacity: 0.5,
    color: 'var(--text-light)',
  },
};

export default Gallery;
