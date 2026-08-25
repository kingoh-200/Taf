import React from 'react';

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, var(--bg-alt) 25%, var(--border) 50%, var(--bg-alt) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite ease-in-out',
  borderRadius: 6,
};

// Inject keyframes once
const styleEl = document.createElement('style');
styleEl.textContent = shimmerKeyframes;
if (!document.getElementById('skeleton-styles')) {
  styleEl.id = 'skeleton-styles';
  document.head.appendChild(styleEl);
}

export const SkeletonLine = ({ width = '100%', height = 14, style }: { width?: string | number; height?: number; style?: React.CSSProperties }) => (
  <div style={{ ...shimmerStyle, width, height, ...style }} />
);

export const SkeletonCircle = ({ size = 48, style }: { size?: number; style?: React.CSSProperties }) => (
  <div style={{ ...shimmerStyle, width: size, height: size, borderRadius: '50%', flexShrink: 0, ...style }} />
);

export const SkeletonCard = ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
  <div className="card" style={{ padding: '1.5rem', ...style }}>
    {children}
  </div>
);

export const MemberCardSkeleton = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
      <SkeletonCircle size={56} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="60%" height={18} style={{ marginBottom: 8 }} />
        <SkeletonLine width="30%" height={14} />
      </div>
    </div>
    <SkeletonLine height={12} style={{ marginBottom: 6 }} />
    <SkeletonLine width="80%" height={12} style={{ marginBottom: 6 }} />
    <SkeletonLine width="50%" height={12} style={{ marginBottom: 12 }} />
    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem' }}>
      <SkeletonLine width={60} height={22} style={{ borderRadius: 12 }} />
      <SkeletonLine width={80} height={22} style={{ borderRadius: 12 }} />
    </div>
  </SkeletonCard>
);

export const EventCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonLine width="70%" height={20} style={{ marginBottom: 10 }} />
    <SkeletonLine width="50%" height={14} style={{ marginBottom: 8 }} />
    <SkeletonLine width="40%" height={14} style={{ marginBottom: 12 }} />
    <SkeletonLine height={12} style={{ marginBottom: 6 }} />
    <SkeletonLine width="90%" height={12} />
  </SkeletonCard>
);

export const GalleryItemSkeleton = () => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ width: '100%', height: 240, ...shimmerStyle }} />
    <div style={{ padding: '0.6rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <SkeletonCircle size={28} />
      <SkeletonLine width={100} height={12} />
    </div>
  </div>
);
