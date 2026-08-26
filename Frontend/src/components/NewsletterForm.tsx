import { useState } from 'react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      return;
    }
    // Store locally (could connect to a real API later)
    const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
    }
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <div style={{ padding: '0.8rem', background: 'rgba(22, 163, 74, 0.1)', borderRadius: 8, border: '1px solid rgba(22, 163, 74, 0.3)' }}>
        <i className="fa-solid fa-check-circle" style={{ color: 'var(--success)', marginRight: '0.4rem' }}></i>
        <span style={{ color: 'var(--success)', fontWeight: 500 }}>You're subscribed! Welcome to the community.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
        placeholder="your@email.com"
        style={{
          flex: 1,
          minWidth: 200,
          padding: '0.65rem 1rem',
          borderRadius: 8,
          border: `1px solid ${status === 'error' ? 'var(--error)' : 'var(--border)'}`,
          background: 'var(--input-bg)',
          color: 'var(--text)',
          fontSize: '0.95rem',
        }}
        required
      />
      <button type="submit" className="btn" style={{ whiteSpace: 'nowrap' }}>
        <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.3rem' }}></i>
        Subscribe
      </button>
    </form>
  );
};

export default NewsletterForm;
