import { useState, useEffect, useCallback } from 'react';
import api, { invalidateCache } from '../api/client';
import { uploadToCloudinary, isCloudinaryConfigured, isVideoFile } from '../utils/cloudinary';
import { processImage } from '../utils/imageProcessor';
import { GalleryItemSkeleton } from '../components/Skeleton';
import NewItemsBanner from '../components/NewItemsBanner';
import { useRealtimePolling } from '../hooks/useRealtimePolling';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface GalleryItem {
  id: number;
  user_id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  category: string | null;
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

/**
 * The current user's like/save state is remembered in localStorage so the
 * buttons stay red/orange even before (or if) the server confirms — and it
 * survives a refresh, a flaky connection or a stale service-worker cache.
 */
type OverlayEntry = Partial<GalleryItem> & { t?: number };

const OVERLAY_KEY = (userId?: number) => `gallery_state:${userId ?? 'anon'}`;
// Remembered state older than this is dropped and the server wins again.
const OVERLAY_TTL = 24 * 60 * 60 * 1000;

function loadOverlay(userId?: number): Map<number, OverlayEntry> {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY(userId));
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, OverlayEntry>;
    const fresh = Object.entries(parsed).filter(
      ([, v]) => v?.t && Date.now() - v.t < OVERLAY_TTL,
    );
    return new Map(fresh.map(([k, v]) => [Number(k), v]));
  } catch {
    return new Map();
  }
}

function persistOverlay(userId: number | undefined, map: Map<number, OverlayEntry>) {
  try {
    localStorage.setItem(OVERLAY_KEY(userId), JSON.stringify(Object.fromEntries(map)));
  } catch {}
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'fa-solid fa-images' },
  { key: 'events', label: 'Events', icon: 'fa-solid fa-calendar-days' },
  { key: 'ministries', label: 'Ministries', icon: 'fa-solid fa-church' },
  { key: 'fellowship', label: 'Fellowship', icon: 'fa-solid fa-handshake' },
  { key: 'outreach', label: 'Outreach', icon: 'fa-solid fa-hand-holding-heart' },
  { key: 'workshops', label: 'Workshops', icon: 'fa-solid fa-laptop-code' },
  { key: 'general', label: 'General', icon: 'fa-solid fa-folder' },
];

const Gallery = () => {
  useDocumentTitle('Gallery');
  const { data: polledItems, loading, newCount, acceptNew, refresh } = useRealtimePolling<GalleryItem[]>('/gallery', [], { interval: 15000, autoApply: true });
  // Local overlay (persisted) — keeps likes/saves alive across refreshes
  const [optimisticItems, setOptimisticItems] = useState<Map<number, OverlayEntry>>(() => loadOverlay());
  // Items uploaded by this user that the feed hasn't caught up with yet
  const [pendingItems, setPendingItems] = useState<GalleryItem[]>([]);
  // Items deleted in this session (hidden immediately, dropped for good)
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const items: GalleryItem[] = [
    ...pendingItems.filter((p) => !polledItems.some((i) => i.id === p.id)),
    ...polledItems,
  ]
    .filter((item) => !deletedIds.includes(item.id))
    .map((item) => {
      const optimistic = optimisticItems.get(item.id);
      return optimistic ? { ...item, ...optimistic } : item;
    });

  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadCategory, setUploadCategory] = useState('general');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number; percent: number } | null>(null);
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
    const parsed = stored ? JSON.parse(stored) : null;
    setUser(parsed);
    setOptimisticItems(loadOverlay(parsed?.id));
  }, []);

  // Once the server agrees with our remembered state, drop the overlay entry.
  useEffect(() => {
    setOptimisticItems((prev) => {
      const next = new Map(prev);
      let changed = false;
      for (const item of polledItems) {
        const ov = next.get(item.id);
        if (!ov) continue;
        const matches =
          (ov.liked === undefined || ov.liked === item.liked) &&
          (ov.saved === undefined || ov.saved === item.saved) &&
          (ov.like_count === undefined || ov.like_count === item.like_count) &&
          (ov.save_count === undefined || ov.save_count === item.save_count);
        if (matches) {
          next.delete(item.id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [polledItems]);

  // Remember likes/saves on this device so they survive a refresh.
  useEffect(() => {
    if (!user) return;
    persistOverlay(user.id, optimisticItems);
  }, [optimisticItems, user]);

  const loadSaved = () => {
    if (!user) return;
    invalidateCache('/gallery/saved');
    api.get('/gallery/saved')
      .then((res) => setSavedItems(res.data.map((i: GalleryItem) => ({ ...i, saved: true }))))
      .catch(() => {});
  };

  useEffect(() => {
    if (user) loadSaved();
  }, [user]);

  const refreshSaved = () => {
    if (user) loadSaved();
  };

  const clearPreviews = useCallback((list: { url: string }[]) => {
    list.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // allow picking the same files again later
    if (!picked.length) return;
    setPreviews((prev) => {
      clearPreviews(prev);
      return picked.map((f) => ({ url: URL.createObjectURL(f), isVideo: isVideoFile(f) }));
    });
    setFiles(picked);
  };

  const resetUploadForm = () => {
    setPreviews((prev) => { clearPreviews(prev); return []; });
    setFiles([]);
    setCaption('');
    setUploadCategory('general');
    setProgress(null);
  };

  // Upload every selected file, one after another, and show each item instantly.
  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setError('');
    const uploaded: GalleryItem[] = [];
    let failed = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const video = isVideoFile(file);
        setProgress({ done: i, total: files.length, percent: 0 });
        try {
          let url: string;
          if (video) {
            if (!isCloudinaryConfigured) {
              throw new Error('Video uploads require Cloudinary. Please configure it in your .env file.');
            }
            url = await uploadToCloudinary(file, 'gallery', {
              onProgress: (percent) => setProgress({ done: i, total: files.length, percent }),
            });
          } else if (isCloudinaryConfigured) {
            url = await uploadToCloudinary(file, 'gallery', {
              onProgress: (percent) => setProgress({ done: i, total: files.length, percent }),
            });
          } else {
            url = await processImage(file, 1200, 0.85);
          }
          const res = await api.post('/gallery', {
            url,
            type: video ? 'video' : 'image',
            caption: caption || null,
            category: uploadCategory,
          });
          uploaded.push(res.data);
        } catch (err: any) {
          failed += 1;
          console.error('Upload failed for', file.name, err);
        }
      }

      if (uploaded.length) {
        // Show them immediately — no refresh, no waiting for the next poll.
        setPendingItems((prev) => [...uploaded.slice().reverse(), ...prev]);
        invalidateCache('/gallery');
        refresh();
      }

      resetUploadForm();

      if (failed > 0) {
        setError(
          uploaded.length
            ? `${failed} of ${files.length} files failed to upload. The rest were added.`
            : 'Failed to upload. Try a smaller file.',
        );
        return;
      }

      setShowUpload(false);
    } finally {
      setUploading(false);
    }
  };

  /** Update the remembered state for one item (kept in localStorage). */
  const setOverlay = (id: number, patch: Partial<GalleryItem>) => {
    setOptimisticItems((prev) => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id), ...patch, t: Date.now() });
      return next;
    });
  };

  const handleLike = async (item: GalleryItem) => {
    if (!user) return;
    // Respond instantly, then remember it locally so a refresh keeps it red.
    setOverlay(item.id, {
      liked: !item.liked,
      like_count: item.liked ? item.like_count - 1 : item.like_count + 1,
    });
    try {
      const res = await api.post(`/gallery/${item.id}/like`);
      setOverlay(item.id, { liked: res.data.liked, like_count: res.data.like_count });
      if (viewItem?.id === item.id) {
        setViewItem({ ...viewItem, liked: res.data.liked, like_count: res.data.like_count });
      }
      invalidateCache('/gallery');
      refresh();
    } catch {}
  };

  const handleSave = async (item: GalleryItem) => {
    if (!user) return;
    setOverlay(item.id, {
      saved: !item.saved,
      save_count: item.saved ? item.save_count - 1 : item.save_count + 1,
    });
    try {
      const res = await api.post(`/gallery/${item.id}/save`);
      setOverlay(item.id, { saved: res.data.saved, save_count: res.data.save_count });
      setSavedItems((prev) => {
        if (res.data.saved) {
          return prev.some((i) => i.id === item.id) ? prev : [item, ...prev];
        }
        return prev.filter((i) => i.id !== item.id);
      });
      if (viewItem?.id === item.id) {
        setViewItem({ ...viewItem, saved: res.data.saved, save_count: res.data.save_count });
      }
      invalidateCache('/gallery');
      refresh();
      refreshSaved();
    } catch {}
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/gallery/${item.id}`);
      setDeletedIds((prev) => [...prev, item.id]);
      setPendingItems((prev) => prev.filter((i) => i.id !== item.id));
      setSavedItems(savedItems.filter((i) => i.id !== item.id));
      setViewItem(null);
      invalidateCache('/gallery');
      refresh();
    } catch {}
  };

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

  useEffect(() => {
    if (viewItem) loadComments(viewItem.id);
    else setComments([]);
  }, [viewItem?.id]);

  // Lightbox navigation
  const filteredItems = activeTab === 'all'
    ? (selectedCategory === 'all' ? items : items.filter((i) => i.category === selectedCategory))
    : savedItems;

  const currentIdx = viewItem ? filteredItems.findIndex((i) => i.id === viewItem.id) : -1;

  const goNext = useCallback(() => {
    if (currentIdx < filteredItems.length - 1) {
      setViewItem(filteredItems[currentIdx + 1]);
    }
  }, [currentIdx, filteredItems]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setViewItem(filteredItems[currentIdx - 1]);
    }
  }, [currentIdx, filteredItems]);

  // Keyboard navigation
  useEffect(() => {
    if (!viewItem) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') setViewItem(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [viewItem, goNext, goPrev]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayItems = activeTab === 'all' ? filteredItems : savedItems;

  return (
    <div style={s.page}>
      {/* ═══ HERO ═══ */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <h1 style={s.heroTitle}>
            <i className="fa-solid fa-images" style={{ marginRight: '0.6rem' }}></i>
            Our Gallery
          </h1>
          <p style={s.heroSubtitle}>
            Moments, memories and experiences from the Teens Aloud community.
          </p>
          {user && (                <button onClick={() => { if (showUpload) resetUploadForm(); setShowUpload(!showUpload); }} style={s.heroBtn}>
                  <i className={`fa-solid ${showUpload ? 'fa-xmark' : 'fa-cloud-arrow-up'}`} style={{ marginRight: '0.4rem' }}></i>
                  {showUpload ? 'Cancel' : 'Upload Photos'}
                </button>
          )}
        </div>
      </section>

      <div style={s.container}>
        {error && <div style={s.error}><i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.4rem' }}></i>{error}</div>}

        <NewItemsBanner count={newCount} onClick={acceptNew} />

        {/* Upload form */}
        {showUpload && (
          <div style={s.uploadCard}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.4rem' }}></i>Upload to Gallery
            </h3>
            {previews.length === 0 ? (
              <label style={s.uploadArea}>
                <i className="fa-solid fa-images" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}></i>
                <p style={{ color: 'var(--text-light)', margin: '0.5rem 0 0', fontWeight: 500 }}>Click to select photos or videos</p>
                <p style={{ color: 'var(--text-muted)', margin: '0.3rem 0 0', fontSize: '0.82rem' }}>
                  You can pick several at once — hold Ctrl / Cmd to select multiple
                </p>
                <input type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
              </label>
            ) : (
              <div>
                <div style={s.previewGrid}>
                  {previews.map((p, i) => (
                    <div key={i} style={s.previewTile}>
                      {p.isVideo ? (
                        <video src={p.url} style={s.previewMedia} muted />
                      ) : (
                        <img src={p.url} alt="Preview" style={s.previewMedia} />
                      )}
                      {p.isVideo && (
                        <span style={s.previewBadge}>
                          <i className="fa-solid fa-video"></i>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {files.length === 1 ? '1 file selected' : `${files.length} files selected`}
                  </span>
                  <label style={s.addMoreBtn}>
                    <i className="fa-solid fa-plus" style={{ marginRight: '0.3rem' }}></i>Choose different files
                    <input type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFileSelect} disabled={uploading} />
                  </label>
                  <button onClick={resetUploadForm} disabled={uploading} style={s.removeBtn}>
                    <i className="fa-solid fa-trash" style={{ marginRight: '0.3rem' }}></i>Clear
                  </button>
                </div>
              </div>
            )}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
              <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Say something about this..." style={{ flex: 1, minWidth: 200, padding: '0.6rem 0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }} />
              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} style={{ padding: '0.6rem 0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.9rem' }}>
                {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            {uploading && progress && (
              <div style={{ marginTop: '0.8rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.3rem' }}>
                  Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}
                  {progress.percent > 0 ? ` — ${progress.percent}%` : ''}
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress.percent}%`, background: 'var(--primary)', transition: 'width 0.2s' }} />
                </div>
              </div>
            )}
            <button onClick={handleUpload} disabled={!files.length || uploading} style={{ ...s.uploadBtn, opacity: !files.length || uploading ? 0.6 : 1 }}>
              {uploading
                ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '0.3rem' }}></i>Uploading...</>
                : <><i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '0.3rem' }}></i>
                    Upload {files.length > 1 ? `${files.length} items` : 'to Gallery'}
                  </>}
            </button>
          </div>
        )}

        {/* Category filters */}
        <div style={s.filtersRow}>
          <div style={s.categoryFilters}>
            {CATEGORIES.map((cat) => {
              const count = cat.key === 'all' ? items.length : items.filter((i) => i.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    ...s.catBtn,
                    ...(selectedCategory === cat.key ? s.catBtnActive : {}),
                  }}
                >
                  <i className={cat.icon} style={{ marginRight: '0.3rem' }}></i>
                  {cat.label}
                  <span style={s.catCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs for logged-in users */}
        {user && (
          <div style={s.tabs}>
            <button onClick={() => setActiveTab('all')} style={{ ...s.tab, ...(activeTab === 'all' ? s.tabActive : {}) }}>
              <i className="fa-solid fa-images" style={{ marginRight: '0.3rem' }}></i>All ({filteredItems.length})
            </button>
            <button onClick={() => setActiveTab('saved')} style={{ ...s.tab, ...(activeTab === 'saved' ? s.tabActive : {}) }}>
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
          <div style={s.empty}>
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
              <div key={item.id} className="masonry-item" style={s.gridItem}>
                {/* Image/Video */}
                <div style={s.mediaContainer} onClick={() => setViewItem(item)}>
                  {item.type === 'video' ? (
                    <video src={item.url} style={s.media} preload="metadata" />
                  ) : (
                    <img src={item.url} alt={item.caption || 'Gallery image'} style={s.media} loading="lazy" />
                  )}
                  <div style={s.mediaOverlay}>
                    <i className={`fa-solid ${item.type === 'video' ? 'fa-play' : 'fa-expand'}`} style={{ color: '#fff', fontSize: '1.5rem' }}></i>
                  </div>
                  {/* Category badge */}
                  {item.category && item.category !== 'general' && (
                    <span style={s.categoryBadge}>
                      {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                    </span>
                  )}
                </div>

                {/* Info bar */}
                <div style={s.infoBar}>
                  <div style={s.author}>
                    {item.author_image ? (
                      <img src={item.author_image} alt="" style={s.authorAvatar} />
                    ) : (
                      <div style={s.authorFallback}>
                        {(item.author_name || item.username || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span style={s.authorName}>{item.author_name || item.username}</span>
                      <span style={s.timeAgo}>{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>
                  <div style={s.actions}>
                    <button onClick={(e) => { e.stopPropagation(); handleLike(item); }} style={{ ...s.actionBtn, color: item.liked ? '#ef4444' : 'var(--text-muted)' }} title="Like">
                      <i className={`${item.liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                      {item.like_count > 0 && <span style={s.count}>{item.like_count}</span>}
                    </button>
                    {user && (
                      <button onClick={(e) => { e.stopPropagation(); handleSave(item); }} style={{ ...s.actionBtn, color: item.saved ? '#F7941D' : 'var(--text-muted)' }} title="Save">
                        <i className={`${item.saved ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                      </button>
                    )}
                    {user && (user.id === item.user_id || user.role === 'admin') && (
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={{ ...s.actionBtn, color: 'var(--error)' }} title="Delete">
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
                {item.caption && (
                  <p style={s.caption}>{item.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ LIGHTBOX ═══ */}
      {viewItem && (
        <div style={s.lightbox} onClick={() => setViewItem(null)}>
          <div style={s.lightboxContent} onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button onClick={() => setViewItem(null)} style={s.lightboxClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Prev arrow */}
            {currentIdx > 0 && (
              <button onClick={goPrev} style={{ ...s.lightboxArrow, left: 12 }}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
            )}

            {/* Next arrow */}
            {currentIdx < filteredItems.length - 1 && (
              <button onClick={goNext} style={{ ...s.lightboxArrow, right: 12 }}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            )}

            {/* Counter */}
            <div style={s.lightboxCounter}>
              {currentIdx + 1} / {filteredItems.length}
            </div>

            {/* Media */}
            {viewItem.type === 'video' ? (
              <video src={viewItem.url} style={s.lightboxMedia} controls autoPlay />
            ) : (
              <img src={viewItem.url} alt={viewItem.caption || 'Gallery image'} style={s.lightboxMedia} />
            )}

            {/* Info */}
            <div style={s.lightboxInfo}>
              <div style={s.lightboxHeader}>
                <div style={s.author}>
                  {viewItem.author_image ? (
                    <img src={viewItem.author_image} alt="" style={{ ...s.authorAvatar, width: 36, height: 36 }} />
                  ) : (
                    <div style={{ ...s.authorFallback, width: 36, height: 36, fontSize: '0.85rem' }}>
                      {(viewItem.author_name || viewItem.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{viewItem.author_name || viewItem.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(viewItem.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                {viewItem.category && viewItem.category !== 'general' && (
                  <span style={{ ...s.categoryBadge, position: 'static' }}>
                    {CATEGORIES.find((c) => c.key === viewItem.category)?.label || viewItem.category}
                  </span>
                )}
              </div>

              {viewItem.caption && <p style={{ margin: '0.6rem 0 0', color: 'var(--text-light)', lineHeight: 1.5 }}>{viewItem.caption}</p>}

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => handleLike(viewItem)} style={{ ...s.actionBtn, color: viewItem.liked ? '#ef4444' : 'var(--text-muted)', fontSize: '1rem' }}>
                  <i className={`${viewItem.liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                  <span style={s.count}>{viewItem.like_count}</span>
                </button>
                {user && (
                  <button onClick={() => handleSave(viewItem)} style={{ ...s.actionBtn, color: viewItem.saved ? '#F7941D' : 'var(--text-muted)', fontSize: '1rem' }}>
                    <i className={`${viewItem.saved ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                    <span style={s.count}>{viewItem.save_count}</span>
                  </button>
                )}
              </div>

              {/* Comments */}
              <div style={{ marginTop: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
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
                      <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.5rem', padding: '0.5rem', background: 'var(--bg-alt)', borderRadius: 10 }}>
                        {c.author_image ? (
                          <img src={c.author_image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #00A0DC, #F7941D)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
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
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      style={{ flex: 1, padding: '0.5rem 0.7rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', fontSize: '0.85rem' }}
                    />
                    <button onClick={handleAddComment} disabled={!newComment.trim()} style={{ padding: '0.5rem 0.8rem', borderRadius: 10, border: 'none', background: newComment.trim() ? 'var(--primary)' : 'var(--border)', color: newComment.trim() ? '#fff' : 'var(--text-muted)', cursor: newComment.trim() ? 'pointer' : 'default', fontSize: '0.85rem' }}>
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

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
  },
  hero: {
    background: 'var(--hero-bg, linear-gradient(135deg, #f0f7ff, #e8f4fd, #fff7ed))',
    padding: '3rem 1.5rem 2.5rem',
    textAlign: 'center',
  },
  heroInner: {
    maxWidth: 700,
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'var(--text)',
    margin: '0 0 0.5rem',
    letterSpacing: '-0.02em',
  },
  heroSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    margin: '0 0 1.2rem',
    lineHeight: 1.6,
  },
  heroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.7rem 1.5rem',
    borderRadius: 12,
    border: 'none',
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 1.5rem 3rem',
  },
  error: {
    padding: '0.8rem 1rem',
    borderRadius: 10,
    background: 'rgba(239,68,68,0.1)',
    color: 'var(--error, #ef4444)',
    fontSize: '0.9rem',
    marginTop: '1rem',
  },
  uploadCard: {
    background: 'var(--card-bg, #fff)',
    borderRadius: 16,
    padding: '1.5rem',
    marginTop: '1.5rem',
    border: '1px solid var(--border)',
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.5rem 2rem',
    border: '2px dashed var(--border)',
    borderRadius: 12,
    cursor: 'pointer',
    background: 'var(--bg)',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
    gap: '0.6rem',
  },
  previewTile: {
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    background: 'var(--bg-alt)',
    aspectRatio: '1 / 1',
  },
  previewMedia: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    borderRadius: 6,
    padding: '0.15rem 0.35rem',
    fontSize: '0.65rem',
  },
  addMoreBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 0.8rem',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-light)',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  removeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 0.8rem',
    borderRadius: 10,
    border: 'none',
    background: 'none',
    color: 'var(--error, #ef4444)',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  uploadBtn: {
    width: '100%',
    marginTop: '1rem',
    padding: '0.7rem',
    borderRadius: 10,
    border: 'none',
    background: 'var(--primary)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  filtersRow: {
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
  },
  categoryFilters: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  catBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
    padding: '0.45rem 0.85rem',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'var(--card-bg, #fff)',
    color: 'var(--text-light)',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  catBtnActive: {
    background: 'var(--primary)',
    color: '#fff',
    borderColor: 'var(--primary)',
  },
  catCount: {
    fontSize: '0.7rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '0.1rem 0.4rem',
    borderRadius: 10,
    marginLeft: '0.1rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    borderRadius: 20,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'var(--primary)',
    color: '#fff',
    borderColor: 'var(--primary)',
  },
  gridItem: {
    background: 'var(--card-bg, #fff)',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid var(--border)',
    marginBottom: '1rem',
    breakInside: 'avoid',
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
    background: 'rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '0.25rem 0.6rem',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 600,
    backdropFilter: 'blur(4px)',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.7rem',
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
    display: 'block',
  },
  timeAgo: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'block',
  },
  actions: {
    display: 'flex',
    gap: '0.2rem',
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
    padding: '0 0.7rem 0.5rem',
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    margin: 0,
    lineHeight: 1.4,
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '0.5rem',
  },
  lightboxContent: {
    maxWidth: 800,
    width: '100%',
    background: 'var(--bg-elevated)',
    borderRadius: 16,
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
    transition: 'background 0.2s',
  },
  lightboxArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  lightboxCounter: {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '0.3rem 0.7rem',
    borderRadius: 8,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    zIndex: 10,
  },
  lightboxMedia: {
    width: '100%',
    maxHeight: '65vh',
    objectFit: 'contain',
    background: '#000',
  },
  lightboxInfo: {
    padding: '1rem 1.2rem',
  },
  lightboxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

export default Gallery;
