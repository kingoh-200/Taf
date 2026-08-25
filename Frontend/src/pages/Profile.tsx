import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { User } from '../api/types';
import { processImage } from '../utils/imageProcessor';
import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinary';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', profile_image: '',
    title: '', department: '', location: '',
    skills: '', social_link: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(stored);
    setUser(userData);
    setForm({
      name: userData.name || '',
      email: userData.email || '',
      profile_image: userData.profile_image || '',
      title: userData.title || '',
      department: userData.department || '',
      location: userData.location || '',
      skills: userData.skills || '',
      social_link: userData.social_link || '',
    });
  }, [navigate]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.put('/profile', {
        name: form.name || null,
        email: form.email || null,
        profile_image: form.profile_image || null,
        title: form.title || null,
        department: form.department || null,
        location: form.location || null,
        skills: form.skills || null,
        social_link: form.social_link || null,
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to update profile');
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put('/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Failed to update password');
      } else {
        setError('Failed to update password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) return <div className="loading"><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>Loading profile...</div>;

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.username.charAt(0).toUpperCase();

  const userSkills = user.skills ? (user as any).skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

  return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto' }}>
      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }}></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="fa-solid fa-circle-check" style={{ marginRight: '0.4rem' }}></i>{success}</div>}

      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          {(user as any).profile_image ? (
            <img src={(user as any).profile_image} alt="Profile" style={styles.avatarImage} />
          ) : (
            <div style={styles.avatar}>
              <span style={styles.initials}>{initials}</span>
            </div>
          )}
          {editing && (
            <label style={{...styles.cameraBtn, opacity: imageUploading ? 0.5 : 1}}>
              {imageUploading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-camera"></i>}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageUploading(true);
                    try {
                      let imageUrl: string;
                      if (isCloudinaryConfigured) {
                        imageUrl = await uploadToCloudinary(file, 'profiles');
                      } else {
                        imageUrl = await processImage(file, 400, 0.8);
                      }
                      setForm({ ...form, profile_image: imageUrl });
                    } catch {
                      setError('Failed to upload image. Try a different file.');
                    } finally {
                      setImageUploading(false);
                    }
                  }
                }}
              />
            </label>
          )}
        </div>

        {!editing ? (
          <>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>
              {user.name || user.username}
            </h1>

            <span style={{
              ...styles.roleBadge,
              background: user.role === 'admin' ? '#fef3c7' : '#e0f4fc',
              color: user.role === 'admin' ? '#92400e' : '#0077A8',
            }}>
              {user.role === 'admin' ? <><i className="fa-solid fa-crown" style={{ marginRight: '0.3rem' }}></i>Admin</> : <><i className="fa-solid fa-id-badge" style={{ marginRight: '0.3rem' }}></i>Member</>}
            </span>

            {/* Profile details */}
            <div style={styles.details}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}><i className="fa-solid fa-at" style={{ marginRight: '0.4rem' }}></i>Username</span>
                <span style={styles.detailValue}>{user.username}</span>
              </div>
              {user.name && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-id-card" style={{ marginRight: '0.4rem' }}></i>Full Name</span>
                  <span style={styles.detailValue}>{user.name}</span>
                </div>
              )}
              {user.email && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-envelope" style={{ marginRight: '0.4rem' }}></i>Email</span>
                  <span style={styles.detailValue}>{user.email}</span>
                </div>
              )}
              {(user as any).title && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-briefcase" style={{ marginRight: '0.4rem' }}></i>Title</span>
                  <span style={styles.detailValue}>{(user as any).title}</span>
                </div>
              )}
              {(user as any).department && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-people-group" style={{ marginRight: '0.4rem' }}></i>Department</span>
                  <span style={styles.detailValue}>{(user as any).department}</span>
                </div>
              )}
              {(user as any).location && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-location-dot" style={{ marginRight: '0.4rem' }}></i>Location</span>
                  <span style={styles.detailValue}>{(user as any).location}</span>
                </div>
              )}
              {(user as any).social_link && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}><i className="fa-solid fa-link" style={{ marginRight: '0.4rem' }}></i>Website</span>
                  <a href={(user as any).social_link} target="_blank" rel="noopener noreferrer" style={{ color: '#00A0DC', fontSize: '0.9rem' }}>{(user as any).social_link}</a>
                </div>
              )}
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}><i className="fa-solid fa-shield-halved" style={{ marginRight: '0.4rem' }}></i>Role</span>
                <span style={styles.detailValue}>{user.role}</span>
              </div>
            </div>

            {/* Skills */}
            {userSkills.length > 0 && (
              <div style={{ textAlign: 'left', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 600 }}>
                  <i className="fa-solid fa-tags" style={{ marginRight: '0.3rem' }}></i>Skills
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                  {userSkills.map((skill: string, i: number) => (
                    <span key={i} style={styles.skillTag}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {user.role === 'admin' && (
              <div style={styles.adminBanner}>
                <i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: '0.4rem' }}></i>You have admin access. Go to the{' '}
                <a href="/admin">Admin Dashboard</a> to manage content.
              </div>
            )}

            {/* Action buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setEditing(true)} className="btn">
                <i className="fa-solid fa-pen-to-square" style={{ marginRight: '0.4rem' }}></i>Edit Profile
              </button>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn btn-secondary">
                <i className="fa-solid fa-key" style={{ marginRight: '0.4rem' }}></i>Change Password
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Edit mode */}
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
              <i className="fa-solid fa-pen-to-square" style={{ marginRight: '0.5rem' }}></i>Edit Profile
            </h1>

            <div style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label><i className="fa-solid fa-id-card" style={{ marginRight: '0.3rem' }}></i>Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-envelope" style={{ marginRight: '0.3rem' }}></i>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-image" style={{ marginRight: '0.3rem' }}></i>Profile Picture URL</label>
                <input type="url" value={form.profile_image} onChange={(e) => setForm({ ...form, profile_image: e.target.value })} placeholder="https://example.com/photo.jpg" />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Or click the camera icon on your avatar to upload a file
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />

              <div className="form-group">
                <label><i className="fa-solid fa-briefcase" style={{ marginRight: '0.3rem' }}></i>Title / Position</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Computer Science Senior" />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-people-group" style={{ marginRight: '0.3rem' }}></i>Department</label>
                <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Media & Communications" />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-location-dot" style={{ marginRight: '0.3rem' }}></i>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Nairobi" />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-tags" style={{ marginRight: '0.3rem' }}></i>Skills</label>
                <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Technology, Web Development, Design" />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Separate skills with commas
                </p>
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-link" style={{ marginRight: '0.3rem' }}></i>Website / Social Link</label>
                <input type="url" value={form.social_link} onChange={(e) => setForm({ ...form, social_link: e.target.value })} placeholder="https://your-website.com" />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleSave} className="btn" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Saving...</> : <><i className="fa-solid fa-check" style={{ marginRight: '0.3rem' }}></i>Save Changes</>}
              </button>
              <button onClick={() => { setEditing(false); setForm({ name: user.name || '', email: user.email || '', profile_image: (user as any).profile_image || '', title: (user as any).title || '', department: (user as any).department || '', location: (user as any).location || '', skills: (user as any).skills || '', social_link: (user as any).social_link || '' }); }} className="btn btn-secondary">
                <i className="fa-solid fa-xmark" style={{ marginRight: '0.3rem' }}></i>Cancel
              </button>
            </div>
          </>
        )}
      </div>

      {/* Password change form */}
      {showPasswordForm && (
        <div className="card" style={{ marginTop: '1.5rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-key" style={{ marginRight: '0.4rem' }}></i>Change Password</h3>

          <div className="form-group">
            <label><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} placeholder="Enter current password" />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>New Password</label>
            <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} placeholder="At least 6 characters" />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} placeholder="Re-enter new password" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handlePasswordChange} className="btn" disabled={passwordLoading}>
              {passwordLoading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Updating...</> : <><i className="fa-solid fa-check" style={{ marginRight: '0.3rem' }}></i>Update Password</>}
            </button>
            <button onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="btn btn-secondary">
              <i className="fa-solid fa-xmark" style={{ marginRight: '0.3rem' }}></i>Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: '0 auto 1.2rem',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A0DC, #F7941D)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e2e8f0',
  },
  initials: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#00A0DC',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px solid #fff',
    fontSize: '0.8rem',
    transition: 'background 0.2s',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.8rem',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  details: {
    textAlign: 'left',
    borderTop: '1px solid var(--border)',
    paddingTop: '1.2rem',
    marginTop: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0',
    borderBottom: '1px solid var(--border-light)',
  },
  detailLabel: {
    color: 'var(--text-light)',
    fontSize: '0.9rem',
  },
  detailValue: {
    fontWeight: 500,
    fontSize: '0.9rem',
    color: 'var(--text)',
  },
  adminBanner: {
    marginTop: '1.5rem',
    padding: '0.8rem 1rem',
    background: 'var(--bg-alt)',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: 'var(--primary)',
    border: '1px solid var(--border)',
  },
  skillTag: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    background: 'var(--bg-alt)',
    color: 'var(--primary)',
    border: '1px solid var(--border)',
  },
};

export default Profile;
