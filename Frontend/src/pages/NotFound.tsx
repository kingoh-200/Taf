import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
      <img src="/logo.png" alt="Teens Aloud Foundation" style={{ height: 60, width: 'auto', marginBottom: '1rem' }} />
      <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '3rem', color: 'var(--error)', marginBottom: '1rem' }}></i>
      <h1 style={{ fontSize: '4rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Page not found</p>
      <Link to="/" className="btn"><i className="fa-solid fa-house" style={{ marginRight: '0.4rem' }}></i>Go Home</Link>
    </div>
  );
};

export default NotFound;
