import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import type { User } from '../api/types';
import { processImage } from '../utils/imageProcessor';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', profile_image: '' });
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

  return (
    <div className="page" style={{ maxWidth: 600, margin: '0 auto' }}>
      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }}></i>{error}</div>}
      {success && <div className="alert alert-success"><i className="fa-solid fa-circle-check" style={{ marginRight: '0.4rem' }}></i>{success}</div>}

      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
        {/* Avatar */}
        <div style={styles.avatarContainer}>
          {user.profile_image ? (
            <img src={user.profile_image} alt="Profile" style={styles.avatarImage} />
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
                      const processed = await processImage(file, 400, 0.8);
                      setForm({ ...form, profile_image: processed });
                    } catch {
                      setError('Failed to process image. Try a different file.');
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
              background: user.role === 'admin' ? '#dbeafe' : '#f0fdf4',
              color: user.role === 'admin' ? '#2563eb' : '#16a34a',
            }}>
              {user.role === 'admin' ? <><i className="fa-solid fa-star" style={{ marginRight: '0.3rem' }}></i>Admin</> : <><i className="fa-solid fa-user" style={{ marginRight: '0.3rem' }}></i>Member</>}
            </span>

            {/* User details */}
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
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}><i className="fa-solid fa-shield-halved" style={{ marginRight: '0.4rem' }}></i>Role</span>
                <span style={styles.detailValue}>{user.role}</span>
              </div>
            </div>

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
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-envelope" style={{ marginRight: '0.3rem' }}></i>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label><i className="fa-solid fa-image" style={{ marginRight: '0.3rem' }}></i>Profile Picture URL</label>
                <input
                  type="url"
                  value={form.profile_image}
                  onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Or click the camera icon on your avatar to upload a file
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleSave} className="btn" disabled={loading}>
                {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Saving...</> : <><i className="fa-solid fa-check" style={{ marginRight: '0.3rem' }}></i>Save Changes</>}
              </button>
              <button onClick={() => { setEditing(false); setForm({ name: user.name || '', email: user.email || '', profile_image: user.profile_image || '' }); }} className="btn btn-secondary">
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
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-lock" style={{ marginRight: '0.3rem' }}></i>Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
            />
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
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: 20,
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
  },
  details: {
    textAlign: 'left',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '1.2rem',
    marginTop: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.6rem 0',
    borderBottom: '1px solid #f1f5f9',
  },
  detailLabel: {
    color: '#64748b',
    fontSize: '0.9rem',
  },
  detailValue: {
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  adminBanner: {
    marginTop: '1.5rem',
    padding: '0.8rem 1rem',
    background: '#e0f4fc',
    borderRadius: 8,
    fontSize: '0.9rem',
    color: '#0077A8',
    border: '1px solid #b3e0f2',
  },
};

export default Profile;
