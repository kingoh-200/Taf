import { useState, useEffect } from 'react';
import api from '../api/client';

interface MemberData {
  id: string | number;
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  title: string | null;
  department: string | null;
  location: string | null;
  skills: string | null;
  social_link: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  source: 'user' | 'manual';
}

const Members = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

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
                <i className="fa-solid fa-star" style={{ marginRight: '0.4rem', color: '#F7941D' }}></i>
                Admins
              </h2>
              <div className="grid-2">
                {admins.map((member) => (
                  <MemberCard key={member.id} member={member} onView={setSelectedMember} />
                ))}
              </div>
            </section>
          )}

          {/* Members Section */}
          {regularMembers.length > 0 && (
            <section>
              <h2 style={styles.sectionTitle}>
                <i className="fa-solid fa-users" style={{ marginRight: '0.4rem', color: '#00A0DC' }}></i>
                Members
              </h2>
              <div className="grid-2">
                {regularMembers.map((member) => (
                  <MemberCard key={member.id} member={member} onView={setSelectedMember} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Member Profile Modal */}
      {selectedMember && (
        <div style={styles.modalOverlay} onClick={() => setSelectedMember(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMember(null)} style={styles.modalClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <MemberDetail member={selectedMember} />
          </div>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, onView }: { member: MemberData; onView: (m: MemberData) => void }) => {
  const isAdmin = member.role === 'admin';
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="card" style={styles.card}>
      {/* Top: Photo + Name + Role */}
      <div style={styles.cardHeader}>
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
        <div style={{ flex: 1 }}>
          <h3 style={styles.name}>{member.name}</h3>
          <span style={{
            ...styles.roleBadge,
            background: isAdmin ? '#fef3c7' : '#e0f4fc',
            color: isAdmin ? '#92400e' : '#0077A8',
          }}>
            <i className={`fa-solid ${isAdmin ? 'fa-crown' : 'fa-id-badge'}`} style={{ marginRight: '0.3rem', fontSize: '0.75rem' }}></i>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={styles.detailsSection}>
        {member.title && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-briefcase" style={styles.detailIcon}></i>
            <span>{member.title}</span>
          </div>
        )}
        {member.department && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-people-group" style={styles.detailIcon}></i>
            <span>{member.department}</span>
          </div>
        )}
        {member.location && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-location-dot" style={styles.detailIcon}></i>
            <span>{member.location}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {member.bio && (
        <p style={styles.bio}>{member.bio}</p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={styles.skillsRow}>
          {skills.map((skill, i) => (
            <span key={i} style={styles.skillTag}>{skill}</span>
          ))}
        </div>
      )}

      {/* Status + Join Date */}
      <div style={styles.footer}>
        <div style={styles.statusRow}>
          <span style={{
            ...styles.statusDot,
            background: member.is_active !== false ? '#16a34a' : '#94a3b8',
          }}></span>
          <span style={{ fontSize: '0.8rem', color: member.is_active !== false ? '#16a34a' : '#94a3b8' }}>
            {member.is_active !== false ? 'Active' : 'Inactive'}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
            <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>
            Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Action row */}
      <div style={styles.actions}>
        {member.email && (
          <a href={`mailto:${member.email}`} style={styles.actionIcon} title="Send email">
            <i className="fa-solid fa-envelope"></i>
          </a>
        )}
        {member.social_link && (
          <a href={member.social_link} target="_blank" rel="noopener noreferrer" style={styles.actionIcon} title="Website / Social">
            <i className="fa-solid fa-link"></i>
          </a>
        )}
        <button onClick={() => onView(member)} style={styles.viewBtn}>View Profile</button>
      </div>
    </div>
  );
};

const MemberDetail = ({ member }: { member: MemberData }) => {
  const isAdmin = member.role === 'admin';
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Large Avatar */}
      <div style={{
        ...styles.modalAvatar,
        background: isAdmin
          ? 'linear-gradient(135deg, #F7941D, #E07E10)'
          : 'linear-gradient(135deg, #00A0DC, #0089BB)',
      }}>
        {member.image_url ? (
          <img src={member.image_url} alt={member.name} style={styles.modalImg} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
        )}
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{member.name}</h2>

      <span style={{
        ...styles.roleBadge,
        background: isAdmin ? '#fef3c7' : '#e0f4fc',
        color: isAdmin ? '#92400e' : '#0077A8',
        marginBottom: '1rem',
      }}>
        <i className={`fa-solid ${isAdmin ? 'fa-crown' : 'fa-id-badge'}`} style={{ marginRight: '0.3rem', fontSize: '0.75rem' }}></i>
        {isAdmin ? 'Admin' : 'Member'}
      </span>

      {/* Details */}
      <div style={{ textAlign: 'left', marginTop: '1rem' }}>
        {member.title && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-briefcase" style={styles.detailIcon}></i>
            <span>{member.title}</span>
          </div>
        )}
        {member.department && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-people-group" style={styles.detailIcon}></i>
            <span>{member.department}</span>
          </div>
        )}
        {member.location && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-location-dot" style={styles.detailIcon}></i>
            <span>{member.location}</span>
          </div>
        )}
        {member.email && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-envelope" style={styles.detailIcon}></i>
            <span>{member.email}</span>
          </div>
        )}
        {member.social_link && (
          <div style={styles.detailLine}>
            <i className="fa-solid fa-link" style={styles.detailIcon}></i>
            <a href={member.social_link} target="_blank" rel="noopener noreferrer" style={{ color: '#00A0DC' }}>{member.social_link}</a>
          </div>
        )}
      </div>

      {/* Bio */}
      {member.bio && (
        <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '1rem', lineHeight: 1.6, textAlign: 'left' }}>
          {member.bio}
        </p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ ...styles.skillsRow, justifyContent: 'center', marginTop: '1rem' }}>
          {skills.map((skill, i) => (
            <span key={i} style={styles.skillTag}>{skill}</span>
          ))}
        </div>
      )}

      {/* Status + Date */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ ...styles.statusDot, background: member.is_active !== false ? '#16a34a' : '#94a3b8' }}></span>
          <span style={{ color: member.is_active !== false ? '#16a34a' : '#94a3b8' }}>{member.is_active !== false ? 'Active' : 'Inactive'}</span>
        </span>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>
          Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
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
  detailsSection: {
    marginTop: '0.8rem',
    paddingTop: '0.6rem',
    borderTop: '1px solid #f1f5f9',
  },
  detailLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: '0.35rem',
  },
  detailIcon: {
    fontSize: '0.8rem',
    color: '#00A0DC',
    width: 16,
    textAlign: 'center',
  },
  bio: {
    fontSize: '0.85rem',
    color: '#64748b',
    marginTop: '0.6rem',
    lineHeight: 1.5,
  },
  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.6rem',
  },
  skillTag: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    background: '#e0f4fc',
    color: '#0077A8',
    border: '1px solid #b3e0f2',
  },
  footer: {
    marginTop: '0.6rem',
    paddingTop: '0.6rem',
    borderTop: '1px solid #f1f5f9',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.8rem',
    paddingTop: '0.6rem',
    borderTop: '1px solid #f1f5f9',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f5f9',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'background 0.2s',
  },
  viewBtn: {
    marginLeft: 'auto',
    padding: '0.4rem 1rem',
    borderRadius: 20,
    border: '1px solid #00A0DC',
    background: 'transparent',
    color: '#00A0DC',
    fontSize: '0.8rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: '#fff',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 480,
    width: '100%',
    maxHeight: '85vh',
    overflow: 'auto',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: '#f1f5f9',
    color: '#64748b',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    margin: '0 auto 1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};

export default Members;
