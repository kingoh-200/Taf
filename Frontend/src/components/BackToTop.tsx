import { useState, useEffect } from 'react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'var(--primary)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 50,
        transition: 'opacity 0.2s, transform 0.2s',
      }}
    >
      <i className="fa-solid fa-arrow-up"></i>
    </button>
  );
};

export default BackToTop;
