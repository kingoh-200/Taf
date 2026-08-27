import { useState, useEffect } from 'react';

const UpdatePrompt = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for waiting service worker on load
        if (registration.waiting) {
          autoUpdate(registration.waiting);
        }

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version found — auto-update silently
              autoUpdate(newWorker);
            }
          });
        });
      });

      // When new SW takes over, reload once
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const autoUpdate = (worker: ServiceWorker) => {
    setUpdating(true);

    // Show brief "Updating..." toast then auto-activate
    setShowUpdate(true);

    // Auto-activate after a short delay (gives user feedback)
    setTimeout(() => {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }, 1500);
  };

  if (!showUpdate) return null;

  return (
    <div style={styles.toast}>
      <div style={styles.content}>
        <i className={`fa-solid ${updating ? 'fa-spinner fa-spin' : 'fa-check-circle'}`} style={{ fontSize: '1.2rem', color: '#16a34a' }}></i>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {updating ? 'Updating to latest version...' : 'Updated!'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            {updating ? 'This will only take a moment' : 'You have the latest version'}
          </div>
        </div>
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
    animation: 'slideUpCentered 0.3s ease-out',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
  },
};

export default UpdatePrompt;
