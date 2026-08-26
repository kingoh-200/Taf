import { useState, useEffect } from 'react';
import api from '../api/client';
import { uploadToCloudinary, isCloudinaryConfigured, isVideoFile } from '../utils/cloudinary';
import { processImage } from '../utils/imageProcessor';
import { GalleryItemSkeleton } from '../components/Skeleton';
import NewItemsBanner from '../components/NewItemsBanner';
import { useRealtimePolling } from '../hooks/useRealtimePolling';

interface GalleryItem {
  id: number;
  user_id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  like_count: number;
  save_count: number;
  created_at: string;
  username: string;
  author_name: string | null;
  author_image: string | null;
  liked: boolean;
  saved: boolean;
}

interface Comment {
  id: number;
  item_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
  author_name: string | null;
  author_image: string | null;
}

const Gallery = () => {
  const { data: polledItems, loading, newCount, acceptNew } = useRealtimePolling<GalleryItem[]>('/gallery', [], { interval: 10000 });
  const [optimisticItems, setOptimisticItems] = useState<Map<number, Partial<GalleryItem>>>(new Map());
  // Merge polled data with optimistic local updates
  const items = polledItems.map((item) => {
    const optimistic = optimisticItems.get(item.id);
    return optimistic ? { ...item, ...optimistic } : item;
  });
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [savedItems, setSavedItems] = useState<GalleryItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [viewItem, setViewItem] = useState<GalleryItem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Clear optimistic updates when polled data catches up
  useEffect(() => {
    setOptimisticItems((prev) => {
      const next = new Map(prev);
      for (const item of polledItems) {
        const optimistic = next.get(item.id);
        if (optimistic) {
          // Check if polled data now matches or exceeds our optimistic update
          if (optimistic.like_count !== undefined && item.like_count >= optimistic.like_count) {
            next.delete(item.id);
          } else if (optimistic.saved !== undefined && item.saved === optimistic.saved) {
            next.delete(item.id);
          }
        }
      }
      return next;
    });
  }, [polledItems]);

  const loadSaved = () => {
    if (!user) return;
    api.get('/gallery/saved')
      .then((res) => setSavedItems(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    if (user && activeTab === 'saved') loadSaved();
  }, [user, activeTab]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError('');

    try {
      let url: string;
      const video = isVideoFile(selectedFile);

      if (video) {
        // Videos must go through Cloudinary (too large for base64)
        if (!isCloudinaryConfigured) {
          setError('Video uploads require Cloudinary. Please configure it in your .env file.');
          setUploading(false);
          return;
        }
        url = await uploadToCloudinary(selectedFile, 'gallery');
      } else if (isCloudinaryConfigured) {
        url = await uploadToCloudinary(selectedFile, 'gallery');
      } else {
        // Fallback: compress image locally as base64
        url = await processImage(selectedFile, 1200, 0.85);
      }

      const isVideo = video;

      const res = await api.post('/gallery', {
        url,
        type: isVideo ? 'video' : 'image',
        caption: caption || null,
      });

      // Add new item optimistically at the top
      setOptimisticItems((prev) => {
        const next = new Map(prev);
        next.set(res.data.id, res.data);
        return next;
      });
      setSelectedFile(null);
      setPreview('');
      setCaption('');
      setShowUpload(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to upload. Try a smaller file.');
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (item: GalleryItem) => {
    if (!user) return;
    // Optimistic update — show immediately
    setOptimisticItems((prev) => {
      const next = new Map(prev);
      next.set(item.id, {
        liked: !item.liked,
        like_count: item.liked ? item.like_count - 1 : item.like_count + 1,
      });
      return next;
    });
    try {
      const res = await api.post(`/gallery/${item.id}/like`);
      // Server confirmed — update with real values
      setOptimisticItems((prev) => {
        const next = new Map(prev);
        next.set(item.id, { liked: res.data.liked, like_count: res.data.like_count });
        return next;
      });
      if (viewItem?.id === item.id) {
        setViewItem({ ...viewItem, liked: res.data.liked, like_count: res.data.like_count });
      }
    } catch {}
  };

  const handleSave = async (item: GalleryItem) => {
    if (!user) return;
    // Optimistic update — show immediately
    setOptimisticItems((prev) => {
      const next = new Map(prev);
      next.set(item.id, {
        saved: !item.saved,
        save_count: item.saved ? item.save_count - 1 : item.save_count + 1,
      });
      return next;
    });
    try {
      const res = await api.post(`/gallery/${item.id}/save`);
      setOptimisticItems((prev) => {
        const next = new Map(prev);
        next.set(item.id, { saved: res.data.saved, save_count: res.data.save_count });
        return next;
      });
      if (viewItem?.id === item.id) {
        setViewItem({ ...viewItem, saved: res.data.saved, save_count: res.data.save_count });
      }
      // Refresh saved list if on saved tab
      if (activeTab === 'saved') loadSaved();
    } catch {}
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/gallery/${item.id}`);
      setOptimisticItems((prev) => {
        const next = new Map(prev);
        next.set(item.id, { ...item, deleted: true } as any);
        return next;
      });
      setSavedItems(savedItems.filter((i) => i.id !== item.id));
      setViewItem(null);
    } catch {}
  };

  // Comments
  const loadComments = async (itemId: number) => {
    setLoadingComments(true);
    try {
      const res = await api.get(`/gallery/${itemId}/comments`);
      setComments(res.data);
    } catch {}
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!viewItem || !newComment.trim()) return;
    try {
      const res = await api.post(`/gallery/${viewItem.id}/comments`, { content: newComment.trim() });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch {}
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!viewItem) return;
    try {
      await api.delete(`/gallery/${viewItem.id}/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {}
  };

  // Load comments when viewing an item
  useEffect(() => {
    if (viewItem) loadComments(viewItem.id);
    else setComments([]);
  }, [viewItem?.id]);

  const displayItems = activeTab === 'all' ? items : savedItems;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1><i className="fa-solid fa-images" style={{ marginRight: '0.5rem' }}></i>Gallery</h1>
          <p style={{ marginBottom: 0 }}>Photos and videos from our club activities.</p>
        </div>
        {user && (
          <button onClick={() => setShowUpload(!showUpload)} className="btn">
            <i className={`fa-solid ${showUpload ? 'fa-xmark' : 'fa-plus'}`} style={{ marginRight: '0.4rem' }}></i>
            {showUpload ? 'Cancel' : 'Upload'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error"><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }}></i>{error}</div>}

      {/* New items banner */}
      <div style={{ marginTop: '0.8rem' }}>
        <NewItemsBanner count={newCount} onClick={acceptNew} />
      </div>

      {/* Upload form */}
      {showUpload && (
        <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}><i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.4rem' }}></i>Upload to Gallery</h3>

          {!preview ? (
            <label style={styles.uploadArea}>
              <i className="fa-solid fa-image" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
              <p style={{ color: 'var(--text-light)', margin: '0.5rem 0 0' }}>Click to select image or video</p>
              <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFileSelect} />
            </label>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {selectedFile?.type.startsWith('video/') ? (
                <video src={preview} style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} controls />
              ) : (
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, objectFit: 'contain' }} />
              )}
              <button onClick={() => { setSelectedFile(null); setPreview(''); }} style={{ marginTop: '0.5rem', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                <i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Remove
              </button>
            </div>
          )}

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label><i className="fa-solid fa-caption" style={{ marginRight: '0.3rem' }}></i>Caption (optional)</label>
            <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Say something about this..." />
          </div>

          <button onClick={handleUpload} className="btn" disabled={!selectedFile || uploading} style={{ width: '100%' }}>
            {uploading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Uploading...</> : <><i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.3rem' }}></i>Upload</>}
          </button>
        </div>
      )}

      {/* Tabs */}
      {user && (
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('all')}
            style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {}) }}
          >
            <i className="fa-solid fa-images" style={{ marginRight: '0.3rem' }}></i>All ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            style={{ ...styles.tab, ...(activeTab === 'saved' ? styles.tabActive : {}) }}
          >
            <i className="fa-solid fa-bookmark" style={{ marginRight: '0.3rem' }}></i>Saved ({savedItems.length})
          </button>
        </div>
      )}

      {/* Gallery Grid — Masonry */}
      {loading ? (
        <div className="masonry-grid">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="masonry-item"><GalleryItemSkeleton /></div>
          ))}
        </div>
      ) : displayItems.length === 0 ? (
        <div style={styles.empty}>
          <i className="fa-solid fa-images" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }}></i>
          <h3 style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
            {activeTab === 'saved' ? 'No saved items yet' : 'Gallery is empty'}
          </h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'saved' ? 'Save images you like and they\'ll appear here.' : (user ? 'Be the first to upload something!' : 'Sign in to upload photos and videos.')}
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {displayItems.map((item) => (
            <div key={item.id} className="card masonry-item" style={styles.gridItem}>
              {/* Image/Video */}
              <div style={styles.mediaContainer} onClick={() => setViewItem(item)}>
                {item.type === 'video' ? (
                  <video src={item.url} style={styles.media} preload="metadata" />
                ) : (
                  <img src={item.url} alt={item.caption || 'Gallery image'} style={styles.media} loading="lazy" />
                )}
                <div style={styles.mediaOverlay}>
                  <i className={`fa-solid ${item.type === 'video' ? 'fa-play' : 'fa-expand'}`} style={{ color: '#fff', fontSize: '1.5rem' }}></i>
                </div>
              </div>

              {/* Info bar */}
              <div style={styles.infoBar}>
                {/* Author */}
                <div style={styles.author}>
                  {item.author_image ? (
                    <img src={item.author_image} alt="" style={styles.authorAvatar} />
                  ) : (
                    <div style={styles.authorFallback}>
                      {(item.author_name || item.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span style={styles.authorName}>{item.author_name || item.username}</span>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button onClick={(e) => { e.stopPropagation(); handleLike(item); }} style={{ ...styles.actionBtn, color: item.liked ? '#ef4444' : 'var(--text-muted)' }} title="Like">
                    <i className={`${item.liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                    {item.like_count > 0 && <span style={styles.count}>{item.like_count}</span>}
                  </button>
                  {user && (
                    <button onClick={(e) => { e.stopPropagation(); handleSave(item); }} style={{ ...styles.actionBtn, color: item.saved ? '#F7941D' : 'var(--text-muted)' }} title="Save">
                      <i className={`${item.saved ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                    </button>
                  )}
                  {user && (user.id === item.user_id || user.role === 'admin') && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={{ ...styles.actionBtn, color: 'var(--error)' }} title="Delete">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Caption */}
              {item.caption && (
                <p style={styles.caption}>{item.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {viewItem && (
        <div style={styles.lightbox} onClick={() => setViewItem(null)}>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewItem(null)} style={styles.lightboxClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            {viewItem.type === 'video' ? (
              <video src={viewItem.url} style={styles.lightboxMedia} controls autoPlay />
            ) : (
              <img src={viewItem.url} alt={viewItem.caption || 'Gallery image'} style={styles.lightboxMedia} />
            )}

            {/* Lightbox info */}
            <div style={styles.lightboxInfo}>
              <div style={styles.author}>
                {viewItem.author_image ? (
                  <img src={viewItem.author_image} alt="" style={styles.authorAvatar} />
                ) : (
                  <div style={styles.authorFallback}>
                    {(viewItem.author_name || viewItem.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={styles.authorName}>{viewItem.author_name || viewItem.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(viewItem.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {viewItem.caption && <p style={{ margin: '0.5rem 0', color: 'var(--text-light)' }}>{viewItem.caption}</p>}

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                {user && (
                  <button onClick={() => handleLike(viewItem)} style={{ ...styles.actionBtn, color: viewItem.liked ? '#ef4444' : 'var(--text-muted)', fontSize: '1rem' }}>
                    <i className={`${viewItem.liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                    <span style={styles.count}>{viewItem.like_count}</span>
                  </button>
                )}
                {user && (
                  <button onClick={() => handleSave(viewItem)} style={{ ...styles.actionBtn, color: viewItem.saved ? '#F7941D' : 'var(--text-muted)', fontSize: '1rem' }}>
                    <i className={`${viewItem.saved ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                    <span style={styles.count}>{viewItem.save_count}</span>
                  </button>
                )}
              </div>

              {/* Comments section */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                  <i className="fa-solid fa-comments" style={{ marginRight: '0.3rem' }}></i>
                  Comments ({comments.length})
                </h4>

                {loadingComments ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading comments...</p>
                ) : comments.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>No comments yet. Be the first!</p>
                ) : (
                  <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: '0.5rem' }}>
                    {comments.map((c) => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem', padding: '0.4rem', background: 'var(--bg-alt)', borderRadius: 8 }}>
                        {c.author_image ? (
                          <img src={c.author_image} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #00A0DC, #F7941D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>
                            {(c.author_name || c.username || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>{c.author_name || c.username}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', wordBreak: 'break-word' }}>{c.content}</div>
                        </div>
                        {user && (user.id === c.user_id || user.role === 'admin') && (
                          <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem', fontSize: '0.7rem' }} title="Delete">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {user && (
                  <div className="comment-input-row">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      style={{ flex: 1, padding: '0.5rem 0.7rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.85rem' }}
                    />
                    <button onClick={handleAddComment} disabled={!newComment.trim()} style={{ padding: '0.5rem 0.8rem', borderRadius: 8, border: 'none', background: newComment.trim() ? 'var(--primary)' : 'var(--border)', color: newComment.trim() ? '#fff' : 'var(--text-muted)', cursor: newComment.trim() ? 'pointer' : 'default', fontSize: '0.85rem' }}>
                      <i className="fa-solid fa-paper-plane"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    border: '2px dashed var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    background: 'var(--bg)',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--primary)',
    color: '#fff',
    borderColor: 'var(--primary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
    gap: '1rem',
  },
  gridItem: {
    padding: 0,
    overflow: 'hidden',
  },
  mediaContainer: {
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    display: 'block',
    objectFit: 'cover' as const,
  },
  mediaOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 0.8rem',
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  authorFallback: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00A0DC, #F7941D)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  authorName: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text)',
  },
  actions: {
    display: 'flex',
    gap: '0.3rem',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.3rem',
    fontSize: '0.9rem',
    transition: 'transform 0.2s',
  },
  count: {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  caption: {
    padding: '0 0.8rem 0.6rem',
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    margin: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0.5rem',
  },
  lightboxContent: {
    maxWidth: 700,
    width: '100%',
    background: 'var(--bg-elevated)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    maxHeight: '95vh',
    display: 'flex',
    flexDirection: 'column',
  },
  lightboxClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxMedia: {
    width: '100%',
    maxHeight: '70vh',
    objectFit: 'contain',
    background: '#000',
  },
  lightboxInfo: {
    padding: '1rem',
  },
};

export default Gallery;
