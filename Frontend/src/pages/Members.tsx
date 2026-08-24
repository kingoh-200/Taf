import { useState, useEffect } from 'react';
import api from '../api/client';

interface MemberData {
  id: string | number;
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: string;
  source: 'user' | 'manual';
}

const Members = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/members')
      .then((res) => setMembers(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading members...</div>;

  const admins = members.filter((m) => m.role === 'admin');
  const regularMembers = members.filter((m) => m.role !== 'admin');

  return (
    <div className="page">
      <h1><i className="fa-solid fa-users" style={{ marginRight: '0.5rem' }}></i>Our Team</h1>
      <p>Meet the people who make this club awesome.</p>

      {members.length === 0 ? (
        <p><i className="fa-solid fa-user-slash" style={{ marginRight: '0.3rem' }}></i>No members to display yet.</p>
      ) : (
        <>
          {/* Admins Section */}
          {admins.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={styles.sectionTitle}>
                <i className="fa-solid fa-star" style={{ marginRight: '0.4rem', color: '#f59e0b' }}></i>
                Admins
              </h2>
              <div className="grid-2">
                {admins.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </section>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <section>
              <h2 style={styles.sectionTitle}>
                <i className="fa-solid fa-users" style={{ marginRight: '0.4rem', color: '#2563eb' }}></i>
                Members
              </h2>
              <div className="grid-2">
                {regularMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

const MemberCard = ({ member }: { member: MemberData }) => {
  const isAdmin = member.role === 'admin';
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="card" style={styles.card}>
      <div style={styles.cardHeader}>
        {/* Avatar */}
        <div style={{
          ...styles.avatar,
          background: isAdmin
            ? 'linear-gradient(135deg, #F7941D, #E07E10)'
            : 'linear-gradient(135deg, #00A0DC, #0089BB)',
        }}>
          {member.image_url ? (
            <img src={member.image_url} alt={member.name} style={styles.img} />
          ) : (
            <span style={styles.initials}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div style={styles.info}>
          <h3 style={styles.name}>{member.name}</h3>
          <span style={{
            ...styles.roleBadge,              background: isAdmin ? '#fef3c7' : '#e0f4fc',
              color: isAdmin ? '#92400e' : '#0077A8',
          }}>
            <i className={`fa-solid ${isAdmin ? 'fa-crown' : 'fa-id-badge'}`} style={{ marginRight: '0.3rem', fontSize: '0.75rem' }}></i>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
      </div>

      {member.bio && (
        <p style={styles.bio}>
          <i className="fa-solid fa-envelope" style={{ marginRight: '0.3rem', fontSize: '0.8rem' }}></i>
          {member.bio}
        </p>
      )}

      <div style={styles.joined}>
        <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>
        Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sectionTitle: {
    fontSize: '1.2rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #00A0DC',
  },
  card: {
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  initials: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: '1.1rem',
    marginBottom: '0.2rem',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.2rem 0.6rem',
    borderRadius: 12,
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  bio: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.8rem',
    paddingTop: '0.8rem',
    borderTop: '1px solid #f1f5f9',
  },
  joined: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '0.6rem',
  },
};

export default Members;
