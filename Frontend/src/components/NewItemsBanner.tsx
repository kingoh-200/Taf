interface NewItemsBannerProps {
  count: number;
  onClick: () => void;
}

const NewItemsBanner = ({ count, onClick }: NewItemsBannerProps) => {
  if (count <= 0) return null;

  return (
    <button onClick={onClick} style={styles.banner}>
      <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.8rem' }}></i>
      {count === 1 ? '1 new item' : `${count} new items`} available — tap to see
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.6rem 1rem',
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    animation: 'slideUp 0.3s ease-out',
  },
};

export default NewItemsBanner;
