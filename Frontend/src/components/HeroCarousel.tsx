import { useState, useEffect } from 'react';

const slides = [
  {
    icon: 'fa-solid fa-church',
    title: 'Teens Aloud Foundation',
    subtitle: 'Eternal interest in teens everywhere',
    description: 'A Non-Denominational Christian youth group challenging a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.',
    gradient: 'linear-gradient(135deg, #00A0DC 0%, #006090 100%)',
  },
  {
    icon: 'fa-solid fa-heart',
    title: 'Love Fellowship',
    subtitle: 'Community & Purpose',
    description: 'Wherever young people are found — in schools, universities, or offices — Love Fellowships are located. A place to belong.',
    gradient: 'linear-gradient(135deg, #F7941D 0%, #E07E10 100%)',
  },
  {
    icon: 'fa-solid fa-mountain-sun',
    title: 'Camp Vista',
    subtitle: 'Re-ignite Your Passion',
    description: 'Camps are a powerful means of re-igniting passions, building strong social networks, and challenging worldviews.',
    gradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
  },
  {
    icon: 'fa-solid fa-globe',
    subtitle: 'Global Reach',
    title: '7+ Countries Strong',
    description: 'From Ghana to South Africa, UK to Nigeria, Canada to France — TAF is reaching teens across the world.',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div style={{ ...styles.carousel, background: slide.gradient }}>
      {/* Dots */}
      <div style={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              ...styles.dot,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
              width: i === current ? 24 : 10,
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div key={current} style={styles.content}>
        <div style={styles.iconCircle}>
          <i className={slide.icon} style={{ fontSize: '1.8rem', color: '#fff' }}></i>
        </div>
        <p style={styles.subtitle}>{slide.subtitle}</p>
        <h1 style={styles.title}>{slide.title}</h1>
        <p style={styles.description}>{slide.description}</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  carousel: {
    position: 'relative',
    borderRadius: 16,
    padding: '3rem 2rem 2.5rem',
    textAlign: 'center',
    overflow: 'hidden',
    minHeight: 320,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.8s ease',
  },
  dots: {
    position: 'absolute',
    bottom: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 8,
    zIndex: 2,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s',
    padding: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'fadeIn 0.6s ease',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    margin: '0 0 0.3rem',
  },
  title: {
    fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
    color: '#fff',
    fontWeight: 700,
    margin: '0 0 0.8rem',
    lineHeight: 1.2,
  },
  description: {
    fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
    color: 'rgba(255,255,255,0.9)',
    maxWidth: 520,
    lineHeight: 1.6,
    margin: 0,
  },
};

export default HeroCarousel;
