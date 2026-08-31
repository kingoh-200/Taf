import { useState, useMemo } from 'react';
import { MemberCardSkeleton } from '../components/Skeleton';
import NewItemsBanner from '../components/NewItemsBanner';
import { useRealtimePolling } from '../hooks/useRealtimePolling';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

const MembersSkeleton = () => (
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ flex: 1, height: 80, borderRadius: 12, background: 'var(--card-bg)', border: '1px solid var(--border)' }} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3, 4].map((i) => <MemberCardSkeleton key={i} />)}
    </div>
  </div>
);

const Members = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: members, loading, newCount, acceptNew } = useRealtimePolling<MemberData[]>('/members', [], { interval: 30000 });
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'member'>('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  // ALL hooks must be called before any early returns (React rules of hooks)
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.bio && m.bio.toLowerCase().includes(search.toLowerCase())) ||
        (m.skills && m.skills.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = filterRole === 'all' || m.role === filterRole;
      const matchesDept = filterDepartment === 'all' || m.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && m.is_active !== false) ||
        (filterStatus === 'inactive' && m.is_active === false);
      return matchesSearch && matchesRole && matchesDept && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [members, search, filterRole, filterDepartment, filterStatus, sortBy]);

  if (loading) return <MembersSkeleton />;

  const departments = [...new Set(members.map((m) => m.department).filter(Boolean))] as string[];

  const activeCount = members.filter((m) => m.is_active !== false).length;

  return (
    <div style={s.page}>
      {/* Hero Header */}
      <div style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroLeft}>
            <h1 style={s.heroTitle}>
              <i className="fa-solid fa-people-group" style={{ color: 'var(--primary)', marginRight: '0.6rem' }}></i>
              Meet Our Team
            </h1>
            <p style={s.heroSubtitle}>
              The passionate people behind Teens Aloud Foundation.<br />
              Together, we learn, grow and create impact.
            </p>
          </div>
          <div style={s.heroIllustration}>
            <i className="fa-solid fa-people-group" style={{ fontSize: '4rem', color: 'var(--primary)', opacity: 0.2 }}></i>
          </div>
        </div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={{ ...s.statIcon, background: 'var(--member-bg)', color: 'var(--primary)' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <div style={s.statNumber}>{members.length}</div>
              <div style={s.statLabel}>Total Members</div>
            </div>
          </div>
          <div style={s.statCard}>
            <div style={{ ...s.statIcon, background: 'rgba(22,163,74,0.15)', color: 'var(--success)' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <div style={s.statNumber}>{activeCount}</div>
              <div style={s.statLabel}>Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      {members.length > 0 && (
        <div style={s.filtersBar}>
          <div style={s.searchBox}>
            <i className="fa-solid fa-magnifying-glass" style={s.searchIcon}></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by name, role, skills..."
              style={s.searchInput}
            />
          </div>
          <div style={s.filterGroup}>
            <div style={s.selectWrap}>
              <i className="fa-solid fa-user" style={s.filterIcon}></i>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} style={s.select}>
                <option value="all">Role</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div style={s.selectWrap}>
              <i className="fa-solid fa-building" style={s.filterIcon}></i>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={s.select}>
                <option value="all">Department</option>
                {departments.map((d) => <option key={d} value={d!}>{d}</option>)}
              </select>
            </div>
            <div style={s.selectWrap}>
              <i className="fa-solid fa-signal" style={s.filterIcon}></i>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} style={s.select}>
                <option value="all">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div style={s.selectWrap}>
              <i className="fa-solid fa-arrow-up-wide-short" style={s.filterIcon}></i>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={s.select}>
                <option value="newest">Sort: Newest</option>
                <option value="oldest">Sort: Oldest</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.5rem' }}>
        <NewItemsBanner count={newCount} onClick={acceptNew} />
      </div>

      {members.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
          <i className="fa-solid fa-user-slash" style={{ marginRight: '0.3rem' }}></i>
          No members to display yet.
        </p>
      ) : (
        <>
          {/* All Members Section */}
          {filteredMembers.length > 0 && (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitleRow}>
                  <i className="fa-solid fa-users" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>
                  <h2 style={s.sectionTitle}>Our Team</h2>
                  <span style={{ ...s.countBadge, background: 'var(--member-bg)', color: 'var(--member-text)' }}>{filteredMembers.length}</span>
                </div>
                <div style={s.sectionDividerBlue}></div>
              </div>
              <div style={s.cardGrid}>
                {filteredMembers.map((member) => (
                  <TeamCard key={member.id} member={member} onView={setSelectedMember} />
                ))}
              </div>
            </section>
          )}

          {filteredMembers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
              No members match your search.
            </div>
          )}
        </>
      )}

      {/* CTA Banner */}
      {!user && (
        <div style={s.ctaBanner}>
          <div style={s.ctaContent}>
            <i className="fa-solid fa-heart" style={{ fontSize: '1.8rem', color: 'var(--primary)' }}></i>
            <div style={{ flex: 1 }}>
              <h3 style={s.ctaTitle}>Want to be part of our journey?</h3>
              <p style={s.ctaSubtitle}>Join a community of young people learning, creating and making an impact.</p>
            </div>
            <button onClick={() => navigate('/register')} style={s.ctaBtn}>
              Become a Member <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.4rem' }}></i>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedMember && (
        <div style={s.modalOverlay} onClick={() => setSelectedMember(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedMember(null)} style={s.modalClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            <MemberDetail member={selectedMember} />
          </div>
        </div>
      )}
    </div>
  );
};

const TeamCard = ({ member, onView }: { member: MemberData; onView: (m: MemberData) => void }) => {
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const joined = new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div style={s.teamCard}>
      <div style={s.cardTop}>
        {/* Avatar */}
        <div style={{
          ...s.cardAvatar,
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        }}>
          {member.image_url ? (
            <img src={member.image_url} alt={member.name} style={s.cardImg} />
          ) : (
            <span style={s.cardInitials}>{initials}</span>
          )}
        </div>

        {/* Name + Role */}
        <div style={{ flex: 1 }}>
          <h3 style={s.cardName}>{member.name}</h3>
          <span style={{
            ...s.roleTag,
            background: 'var(--member-bg)',
            color: 'var(--member-text)',
          }}>
            <i className="fa-solid fa-id-badge" style={{ fontSize: '0.7rem', marginRight: '0.25rem' }}></i>
            Member
          </span>
        </div>
      </div>

      {/* Details */}
      <div style={s.cardDetails}>
        {member.title && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-briefcase" style={s.detailIcon}></i>
            <span>{member.title}</span>
          </div>
        )}
        {member.department && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-building" style={s.detailIcon}></i>
            <span>{member.department}</span>
          </div>
        )}
        {member.location && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-location-dot" style={s.detailIcon}></i>
            <span>{member.location}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {member.bio && (
        <p style={s.cardBio}>{member.bio}</p>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={s.skillsRow}>
          {skills.map((skill, i) => (
            <span key={i} style={s.skillChip}>{skill}</span>
          ))}
        </div>
      )}

      {/* Footer: Status + Joined */}
      <div style={s.cardFooter}>
        <div style={s.statusRow}>
          <span style={{ ...s.statusDot, background: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}></span>
          <span style={{ fontSize: '0.8rem', color: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}>
            {member.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
        <span style={s.joinedDate}>
          <i className="fa-solid fa-calendar" style={{ marginRight: '0.25rem' }}></i>
          Joined {joined}
        </span>
      </div>

      {/* Actions */}
      <div style={s.cardActions}>
        {member.email && (
          <a href={`mailto:${member.email}`} style={s.emailIcon} title="Send email">
            <i className="fa-solid fa-envelope"></i>
          </a>
        )}
        <button onClick={() => onView(member)} style={s.viewProfileBtn}>
          View Profile <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem', fontSize: '0.7rem' }}></i>
        </button>
      </div>
    </div>
  );
};

const MemberDetail = ({ member }: { member: MemberData }) => {
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%', margin: '0 auto 1rem',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {member.image_url ? (
          <img src={member.image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#fff' }}>{initials}</span>
        )}
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{member.name}</h2>
      <span style={{
        ...s.roleTag,
        background: 'var(--member-bg)',
        color: 'var(--member-text)',
        marginBottom: '1rem', display: 'inline-flex',
      }}>
        <i className="fa-solid fa-id-badge" style={{ fontSize: '0.7rem', marginRight: '0.25rem' }}></i>
        Member
      </span>

      <div style={{ textAlign: 'left', marginTop: '1rem' }}>
        {member.title && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-briefcase" style={s.detailIcon}></i>
            <span>{member.title}</span>
          </div>
        )}
        {member.department && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-building" style={s.detailIcon}></i>
            <span>{member.department}</span>
          </div>
        )}
        {member.location && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-location-dot" style={s.detailIcon}></i>
            <span>{member.location}</span>
          </div>
        )}
        {member.email && (
          <div style={s.detailLine}>
            <i className="fa-solid fa-envelope" style={s.detailIcon}></i>
            <span>{member.email}</span>
          </div>
        )}
      </div>

      {member.bio && (
        <p style={{ fontSize: '0.9rem', color: 'var(--text-light, #64748b)', marginTop: '1rem', lineHeight: 1.6, textAlign: 'left' }}>
          {member.bio}
        </p>
      )}

      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '1rem' }}>
          {skills.map((skill, i) => (
            <span key={i} style={s.skillChip}>{skill}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border, #e2e8f0)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ ...s.statusDot, background: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}></span>
          <span style={{ color: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}>{member.is_active !== false ? 'Active' : 'Inactive'}</span>
        </span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
          <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>
          Joined {new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1rem 2rem',
  },

  // Hero
  hero: {
    background: 'var(--hero-bg)',
    borderRadius: 16,
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid var(--border)',
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    marginBottom: '1.5rem',
  },
  heroLeft: { flex: 1 },
  heroTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '0.5rem',
  },
  heroSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    lineHeight: 1.6,
  },
  heroIllustration: {
    flexShrink: 0,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    background: 'var(--card-bg)',
    borderRadius: 12,
    padding: '1rem',
    border: '1px solid var(--border)',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
  },

  // Filters
  filtersBar: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '1rem',
    marginTop: '0.5rem',
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted, #94a3b8)',
    fontSize: '0.85rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.6rem 0.8rem 0.6rem 2.4rem',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text)',
    fontSize: '0.88rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  selectWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute' as const,
    left: 10,
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    pointerEvents: 'none' as const,
  },
  select: {
    padding: '0.6rem 0.7rem 0.6rem 2rem',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    appearance: 'auto' as const,
  },

  // Sections
  section: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    marginBottom: '1rem',
  },
  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text)',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 8,
    fontSize: '0.8rem',
    fontWeight: 700,
  },
  sectionDividerOrange: {
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, var(--accent), transparent)',
  },
  sectionDividerBlue: {
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, var(--primary, #00A0DC), transparent)',
  },

  // Card grid
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },

  // Team card
  teamCard: {
    background: 'var(--card-bg)',
    borderRadius: 14,
    padding: '1.2rem',
    border: '1px solid var(--border)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '0.8rem',
  },
  cardAvatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardInitials: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#fff',
  },
  crownBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--card-bg, #fff)',
  },
  cardName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.2rem',
  },
  roleTag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    borderRadius: 10,
    fontSize: '0.72rem',
    fontWeight: 600,
  },
  cardDetails: {
    marginBottom: '0.5rem',
  },
  detailLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    marginBottom: '0.2rem',
  },
  detailIcon: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    width: 14,
    textAlign: 'center' as const,
  },
  cardBio: {
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    lineHeight: 1.5,
    marginBottom: '0.5rem',
  },
  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    marginBottom: '0.5rem',
  },
  skillChip: {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 10,
    fontSize: '0.72rem',
    fontWeight: 500,
    background: 'var(--bg-alt)',
    color: 'var(--primary)',
    border: '1px solid var(--border)',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-light)',
    marginTop: '0.3rem',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
  },
  joinedDate: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginTop: '0.6rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid var(--border-light)',
  },
  emailIcon: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-alt)',
    color: 'var(--text-light)',
    textDecoration: 'none',
    fontSize: '0.82rem',
  },
  viewProfileBtn: {
    marginLeft: 'auto',
    padding: '0.35rem 0.9rem',
    borderRadius: 18,
    border: '1px solid var(--primary)',
    background: 'transparent',
    color: 'var(--primary)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
  },

  // CTA
  ctaBanner: {
    background: 'var(--bg-alt)',
    borderRadius: 16,
    padding: '1.5rem 2rem',
    marginTop: '1rem',
    border: '1px solid var(--border)',
  },
  ctaContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    flexWrap: 'wrap' as const,
  },
  ctaTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '0.2rem',
  },
  ctaSubtitle: {
    fontSize: '0.88rem',
    color: 'var(--text-light)',
  },
  ctaBtn: {
    padding: '0.6rem 1.5rem',
    borderRadius: 25,
    border: 'none',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
  },

  // Modal
  modalOverlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0.5rem',
  },
  modal: {
    background: 'var(--card-bg)',
    borderRadius: 16,
    padding: 'clamp(1rem, 3vw, 2rem)',
    maxWidth: 480,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
  },
  modalClose: {
    position: 'absolute' as const,
    top: 12, right: 12,
    width: 32, height: 32,
    borderRadius: '50%',
    border: 'none',
    background: 'var(--bg-alt)',
    color: 'var(--text-light)',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Members;
