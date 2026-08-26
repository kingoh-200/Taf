import { useState, useEffect } from 'react';

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check if there's a waiting service worker (new version)
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              setWaitingWorker(newWorker);
              setShowUpdate(true);
            }
          });
        });
      });

      // Listen for controlling change (new SW activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting and activate
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div style={styles.toast}>
      <div style={styles.content}>
        <i className="fa-solid fa-arrows-rotate" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}></i>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>New version available</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Refresh to get the latest updates</div>
        </div>
        <button onClick={handleUpdate} style={styles.refreshBtn}>
          <i className="fa-solid fa-download" style={{ marginRight: '0.3rem' }}></i>
          Refresh
        </button>
        <button onClick={() => setShowUpdate(false)} style={styles.closeBtn}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'var(--bg-elevated)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    border: '1px solid var(--border)',
    padding: '0.7rem 1rem',
    zIndex: 10000,
    maxWidth: 420,
    width: 'calc(100% - 2rem)',
    animation: 'slideUp 0.3s ease-out',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.4rem 0.8rem',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--bg-alt)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    flexShrink: 0,
  },
};

export default UpdatePrompt;
