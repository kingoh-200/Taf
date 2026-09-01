import { useState, useMemo, useEffect } from 'react';
import { MemberCardSkeleton } from '../components/Skeleton';
import NewItemsBanner from '../components/NewItemsBanner';
import { useRealtimePolling } from '../hooks/useRealtimePolling';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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

/** Split view wrapper — shows member list on left, profile on right */
const MembersSplitView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: members, loading, newCount, acceptNew } = useRealtimePolling<MemberData[]>('/members', [], { interval: 30000 });
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        (m.role && m.role.toLowerCase().includes(search.toLowerCase())) ||
        (m.skills && m.skills.toLowerCase().includes(search.toLowerCase()));
      const matchesDept = filterDepartment === 'all' || m.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && m.is_active !== false) ||
        (filterStatus === 'inactive' && m.is_active === false);
      return matchesSearch && matchesDept && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [members, search, filterDepartment, filterStatus, sortBy]);

  const activeCount = members.filter((m) => m.is_active !== false).length;
  const departments = [...new Set(members.map((m) => m.department).filter(Boolean))] as string[];

  if (loading) return <MembersSkeleton />;

  return (
    <div className="split-view" style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* LEFT: Member List */}
      <div className="split-view-left" style={{
        flex: selectedMember ? '0 0 520px' : '1 1 100%',
        borderRight: selectedMember ? '1px solid var(--border, #e2e8f0)' : 'none',
        overflowY: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        background: 'var(--bg, #f8fafc)',
      }}>
        <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
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

          {members.length > 0 && (
            <div style={s.filtersBar}>
              <div style={s.searchBox}>
                <i className="fa-solid fa-magnifying-glass" style={s.searchIcon}></i>
                <input type="text" placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} style={s.searchInput} />
              </div>
              <div style={s.filtersRow}>

                <div style={s.selectWrap}>
                  <i className="fa-solid fa-building" style={s.filterIcon}></i>
                  <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={s.select}>
                    <option value="all">Department</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
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
          ) : filteredMembers.length > 0 ? (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <div style={s.sectionTitleRow}>
                  <i className="fa-solid fa-users" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>
                  <h2 style={s.sectionTitle}>Our Team</h2>
                  <span style={{ ...s.countBadge, background: 'var(--member-bg)', color: 'var(--member-text)' }}>{filteredMembers.length}</span>
                </div>
                <div style={s.sectionDividerBlue}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '1fr', gap: '0.75rem', flex: 1 }}>
                {[...filteredMembers].sort((a, b) => {
                  if (selectedMember && a.id === selectedMember.id) return -1;
                  if (selectedMember && b.id === selectedMember.id) return 1;
                  return 0;
                }).map((member) => (
                  <TeamCard key={member.id} member={member} onView={setSelectedMember} isSelected={selectedMember?.id === member.id} />
                ))}
              </div>
            </section>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
              No members match your search.
            </div>
          )}

          {!user && !selectedMember && (
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
        </div>
      </div>

      {/* RIGHT: Profile Detail (sticky side panel) */}
      {selectedMember && (
        <div className="split-view-right" style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: 64,
          background: 'var(--card-bg, #fff)',
        }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--card-bg, #fff)', borderBottom: '1px solid var(--border, #e2e8f0)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              onClick={() => setSelectedMember(null)}
              style={{ background: 'var(--bg-alt, #f0f7ff)', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text, #1e293b)', fontSize: '1rem' }}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text, #1e293b)' }}>Profile</span>
          </div>
          <MemberDetail member={selectedMember} />
        </div>
      )}
    </div>
  );
};

const TeamCard = ({ member, onView, isSelected }: { member: MemberData; onView: (m: MemberData) => void; isSelected?: boolean }) => {
  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className={`team-card${isSelected ? ' team-card-selected' : ''}`} style={{ ...s.teamCard, cursor: 'pointer' }} onClick={() => onView(member)}>
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

      {/* Details — compact */}
      <div style={{ marginBottom: '0.3rem' }}>
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
      </div>

      {/* Skills — max 3 shown */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.4rem' }}>
          {skills.slice(0, 3).map((skill, i) => (
            <span key={i} style={{ padding: '0.12rem 0.45rem', borderRadius: 8, fontSize: '0.65rem', fontWeight: 600, background: 'var(--bg-alt)', color: 'var(--primary)', border: '1px solid var(--border)' }}>{skill}</span>
          ))}
          {skills.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{skills.length - 3}</span>}
        </div>
      )}

      {/* Footer: Status + View */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.4rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}></span>
          <span style={{ fontSize: '0.7rem', color: member.is_active !== false ? 'var(--success)' : 'var(--text-muted)' }}>
            {member.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          View <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.6rem' }}></i>
        </span>
      </div>
    </div>
  );
};

const MemberDetail = ({ member }: { member: MemberData }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'achievements'>('about');

  const initials = member.name
    ? member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const skills = member.skills ? member.skills.split(',').map((sk) => sk.trim()).filter(Boolean) : [];
  const joined = new Date(member.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    if (!member.id) return;
    api.get(`/profile/${member.id}/projects`).then((r) => setProjects(r.data)).catch(() => {});
    api.get(`/profile/${member.id}/achievements`).then((r) => setAchievements(r.data)).catch(() => {});
  }, [member.id]);

  return (
    <div style={{ width: '100%' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary, #0077B6), var(--primary-dark, #005f8f), var(--accent, #F7941D))',
        borderRadius: '16px 16px 0 0',
        padding: '2.5rem 2rem 3.5rem',
        position: 'relative',
        textAlign: 'center',
      }}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%', margin: '0 auto 1rem',
          background: 'var(--card-bg, #fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          border: '4px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          position: 'relative',
          top: '1.5rem',
        }}>
          {member.image_url ? (
            <img src={member.image_url} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary, #0077B6)' }}>{initials}</span>
          )}
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginTop: '1.5rem', marginBottom: '0.3rem' }}>{member.name}</h2>
        {member.title && (
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem' }}>
            <i className="fa-solid fa-briefcase" style={{ marginRight: '0.4rem' }}></i>
            {member.title}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          {member.location && (
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>
              {member.location}
            </span>
          )}
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: member.is_active !== false ? '#4ade80' : '#94a3b8', marginRight: '0.3rem' }}></span>
            {member.is_active !== false ? 'Available' : 'Inactive'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
            <i className="fa-solid fa-calendar" style={{ marginRight: '0.3rem' }}></i>
            Joined {joined}
          </span>
        </div>
      </div>

      {/* Social Links */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', padding: '1.5rem 1rem 0', background: 'var(--card-bg, #fff)' }}>
        {member.social_link && (
          <a href={member.social_link} target="_blank" rel="noopener noreferrer" style={{ padding: '0.45rem 1rem', borderRadius: 8, background: 'var(--bg-alt, #f0f7ff)', color: 'var(--primary, #0077B6)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', border: '1px solid var(--border, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}>
            <i className="fa-solid fa-globe"></i> Portfolio
          </a>
        )}
        {member.email && (
          <a href={`mailto:${member.email}`} style={{ padding: '0.45rem 1rem', borderRadius: 8, background: 'var(--primary, #0077B6)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s' }}>
            <i className="fa-solid fa-envelope"></i> Message
          </a>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border, #e2e8f0)', background: 'var(--card-bg, #fff)', padding: '0 1rem' }}>
        {([
          { key: 'about', label: 'About', icon: 'fa-user' },
          { key: 'projects', label: 'Projects', icon: 'fa-folder-open' },
          { key: 'achievements', label: 'Achievements', icon: 'fa-trophy' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? 'var(--primary, #0077B6)' : 'var(--text-muted, #94a3b8)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary, #0077B6)' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
            }}
          >
            <i className={`fa-solid ${tab.icon}`} style={{ fontSize: '0.75rem' }}></i>
            {tab.label}
            {tab.key === 'projects' && projects.length > 0 && (
              <span style={{ background: 'var(--primary, #0077B6)', color: '#fff', borderRadius: 10, padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, marginLeft: '0.2rem' }}>{projects.length}</span>
            )}
            {tab.key === 'achievements' && achievements.length > 0 && (
              <span style={{ background: 'var(--accent, #F7941D)', color: '#fff', borderRadius: 10, padding: '0.1rem 0.4rem', fontSize: '0.65rem', fontWeight: 700, marginLeft: '0.2rem' }}>{achievements.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '1.5rem', background: 'var(--card-bg, #fff)', borderRadius: '0 0 16px 16px' }}>
        {/* About Tab */}
        {activeTab === 'about' && (
          <div>
            {member.bio && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '0.5rem' }}>
                  <i className="fa-solid fa-user" style={{ marginRight: '0.4rem', color: 'var(--primary, #0077B6)' }}></i>
                  About {member.name?.split(' ')[0]}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-light, #64748b)', lineHeight: 1.7 }}>{member.bio}</p>
              </div>
            )}
            {!member.bio && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)', textAlign: 'center', padding: '1rem' }}>No bio added yet.</p>
            )}

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {member.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem', borderRadius: 10, background: 'var(--bg-alt, #f0f7ff)' }}>
                  <i className="fa-solid fa-building" style={{ color: 'var(--primary, #0077B6)', fontSize: '0.9rem' }}></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text, #1e293b)', fontWeight: 600 }}>{member.department}</div>
                  </div>
                </div>
              )}
              {member.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem', borderRadius: 10, background: 'var(--bg-alt, #f0f7ff)' }}>
                  <i className="fa-solid fa-location-dot" style={{ color: 'var(--primary, #0077B6)', fontSize: '0.9rem' }}></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text, #1e293b)', fontWeight: 600 }}>{member.location}</div>
                  </div>
                </div>
              )}
              {member.title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem', borderRadius: 10, background: 'var(--bg-alt, #f0f7ff)' }}>
                  <i className="fa-solid fa-briefcase" style={{ color: 'var(--primary, #0077B6)', fontSize: '0.9rem' }}></i>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text, #1e293b)', fontWeight: 600 }}>{member.title}</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem', borderRadius: 10, background: 'var(--bg-alt, #f0f7ff)' }}>
                <i className="fa-solid fa-calendar" style={{ color: 'var(--primary, #0077B6)', fontSize: '0.9rem' }}></i>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text, #1e293b)', fontWeight: 600 }}>{joined}</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '0.6rem' }}>
                  <i className="fa-solid fa-code" style={{ marginRight: '0.4rem', color: 'var(--primary, #0077B6)' }}></i>
                  Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {skills.map((skill, i) => (
                    <span key={i} style={{ padding: '0.35rem 0.75rem', borderRadius: 20, background: 'var(--primary, #0077B6)', color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            {projects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted, #94a3b8)' }}>
                <i className="fa-solid fa-folder-open" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
                <p>No projects yet.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem' }}>
                {projects.map((project) => (
                  <div key={project.id} style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-alt, #f0f7ff)', border: '1px solid var(--border, #e2e8f0)', transition: 'transform 0.2s' }}>
                    {project.image_url && (
                      <img src={project.image_url} alt={project.title} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: '0.6rem' }} />
                    )}
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: '0.3rem' }}>{project.title}</h4>
                    {project.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)', lineHeight: 1.4, marginBottom: '0.5rem' }}>{project.description.slice(0, 80)}{project.description.length > 80 ? '...' : ''}</p>
                    )}
                    {project.tech_stack && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                        {project.tech_stack.split(',').map((t: string, i: number) => (
                          <span key={i} style={{ padding: '0.15rem 0.5rem', borderRadius: 12, background: 'var(--primary, #0077B6)', color: '#fff', fontSize: '0.65rem', fontWeight: 600 }}>{t.trim()}</span>
                        ))}
                      </div>
                    )}
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary, #0077B6)', fontWeight: 600, textDecoration: 'none' }}>
                        View Project <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.65rem', marginLeft: '0.2rem' }}></i>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            {achievements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted, #94a3b8)' }}>
                <i className="fa-solid fa-trophy" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block', opacity: 0.4 }}></i>
                <p>No achievements yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {achievements.map((ach) => (
                  <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: 12, background: 'var(--bg-alt, #f0f7ff)', border: '1px solid var(--border, #e2e8f0)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent, #F7941D), #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${ach.icon || 'fa-trophy'}`} style={{ color: '#fff', fontSize: '0.9rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #1e293b)', margin: 0 }}>{ach.title}</h4>
                      {ach.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)', margin: '0.2rem 0 0' }}>{ach.description}</p>}
                    </div>
                    {ach.date && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', whiteSpace: 'nowrap' }}>{ach.date}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    margin: 0,
    padding: 0,
  },

  // Hero
  hero: {
    background: 'var(--hero-bg)',
    borderRadius: 14,
    padding: '1.2rem 1.5rem',
    marginBottom: '0.8rem',
    border: '1px solid var(--border)',
    flexShrink: 0,
  },
  heroContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '0.8rem',
  },
  heroLeft: { flex: 1 },
  heroTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: '0.3rem',
  },
  heroSubtitle: {
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    lineHeight: 1.5,
  },
  heroIllustration: {
    flexShrink: 0,
    display: 'none',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.6rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--card-bg)',
    borderRadius: 10,
    padding: '0.6rem 0.8rem',
    border: '1px solid var(--border)',
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
  },
  statNumber: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-light)',
  },

  // Filters
  filtersBar: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '0.6rem',
    marginTop: '0.2rem',
    flexShrink: 0,
  },
  searchBox: {
    flex: 1,
    minWidth: 180,
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
    padding: '0.45rem 0.7rem 0.45rem 2.2rem',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text)',
    fontSize: '0.8rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  filterGroup: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  selectWrap: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  filterIcon: {
    position: 'absolute' as const,
    left: 8,
    color: 'var(--text-muted)',
    fontSize: '0.7rem',
    pointerEvents: 'none' as const,
  },
  select: {
    padding: '0.45rem 0.6rem 0.45rem 1.8rem',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--input-bg)',
    color: 'var(--text)',
    fontSize: '0.78rem',
    cursor: 'pointer',
    appearance: 'auto' as const,
  },

  // Sections
  section: {
    marginBottom: '1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
  },
  sectionHeader: {
    marginBottom: '0.6rem',
    flexShrink: 0,
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
    borderRadius: 12,
    padding: '0.9rem',
    border: '1.5px solid var(--border)',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    cursor: 'pointer',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    marginBottom: '0.5rem',
  },
  cardAvatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    position: 'relative' as const,
    border: '2px solid rgba(255,255,255,0.3)',
  },
  cardImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  cardInitials: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#fff',
  },
  crownBadge: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--card-bg, #fff)',
  },
  cardName: {
    fontSize: '0.88rem',
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: '0.15rem',
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
    padding: 0,
    maxWidth: 780,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative' as const,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
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

export default MembersSplitView;
