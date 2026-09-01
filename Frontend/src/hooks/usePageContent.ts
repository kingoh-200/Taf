import { useState, useEffect, useCallback } from 'react';
import { cachedGet } from '../api/client';

interface ContentSection {
  id: number;
  page_key: string;
  section_key: string;
  title: string | null;
  body: string | null;
  meta: any;
}

interface PageContent {
  [sectionKey: string]: ContentSection;
}

// Default content for each page (fallback if database is empty)
export const DEFAULT_CONTENT: Record<string, Record<string, { title?: string; body?: string }>> = {
  home: {
    hero: {
      title: 'EMPOWERING TEENS. BUILDING FUTURES.',
      body: 'Creating opportunities, inspiring growth, and building a stronger generation.',
    },
    about: {
      title: 'About Teens Aloud',
      body: 'We believe every young person has the potential to make a difference. Teens Aloud Foundation is a Non-Denominational Christian fellowship with the vision to challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.',
    },
    cta: {
      title: 'Get Involved',
      body: 'Become part of Teens Aloud Foundation',
    },
    ministries_intro: {
      title: 'Our Ministries',
      body: 'Empowering young people through faith, fellowship, and purpose-driven programs.',
    },
  },
  about: {
    hero: {
      title: 'About Teens Aloud Foundation',
      body: 'Eternal interest in teens everywhere',
    },
    who_we_are: {
      title: 'Who We Are',
      body: "Teens Aloud Foundation (TAF) is a Non-Denominational, Inter-Denominational Christian youth group founded in 2005 by Rev. KK Baidoo. We believe deeply in the potential of every young person, especially teenagers, and have chosen to invest in them through various evangelistic and discipleship means.\n\nWhat started in Ghana has grown into a global movement spanning multiple countries across Africa, Europe, and North America. Our community is built on love, accountability, and a shared passion for Jesus Christ.",
    },
    mission: {
      title: 'Our Mission',
      body: 'To challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ through evangelism, discipleship, and community.',
    },
    vision: {
      title: 'Our Vision',
      body: 'To raise a generation of young people who are grounded in faith, equipped with purpose, and empowered to impact their world for Christ.',
    },
    founder: {
      title: 'Rev. KK Baidoo',
      body: 'Founder & Global Executive Director',
    },
    founder_bio: {
      title: 'Founder Bio',
      body: 'A passionate shepherd of young people, Rev. KK Baidoo founded Teens Aloud Foundation in 2005 with a heart to see teens discover their purpose in God. He continues to lead the global movement with vision, wisdom, and an unwavering love for the next generation.',
    },
    countries: {
      title: 'Where We Are',
      body: 'Ghana, Nigeria, South Africa, Kenya, UK, Canada, France, Eswatini',
    },
    cta: {
      title: 'Seize the Moment!!!',
      body: "We hope you will draw closer to God and be inspired to partner with us. Feel free to connect with us — we'd love to hear from you.",
    },
  },
  ministries: {
    hero: {
      title: 'Our Ministries',
      body: 'We are a Non-Denominational Christian fellowship with the vision to challenge a young generation to believe in their gifted purpose and passionately pursue Jesus Christ.',
    },
    cta: {
      title: 'Want to be part of what God is doing?',
      body: "Whether you're a teen, young adult, or someone who believes in the potential of young people — there's a place for you here.",
    },
  },
  footer: {
    info: {
      title: 'Teens Aloud Foundation',
      body: JSON.stringify({
        tagline: 'Empowering Teens. Building Futures.',
        copyright: '© 2026 Teens Aloud Foundation. All rights reserved.',
        email: 'info@teensaloud.com',
        phone: '+254 700 000 000',
        address: 'Nairobi, Kenya',
        facebook: 'https://facebook.com/teensaloud',
        twitter: 'https://twitter.com/teensaloud',
        instagram: 'https://instagram.com/teensaloud',
        youtube: 'https://youtube.com/teensaloud',
      }),
    },
  },
};

// Default ministries data
export const DEFAULT_MINISTRIES = [
  {
    id: 'love-fellowship',
    title: 'Love Fellowship',
    icon: 'fa-heart',
    color: '#ef4444',
    description: 'Everything starts from this sub-ministry which seeks to bring young people together to regularly meet and spur themselves unto love and good works.',
    details: 'Wherever young people are found — whether in communal settlements, schools, universities, or offices — Love Fellowships are located. All Teens Aloud members belong to a Love Fellowship, making it the heartbeat of our community.',
  },
  {
    id: 'camp-vista',
    title: 'Camp Vista',
    icon: 'fa-campground',
    color: '#16a34a',
    description: 'Camps are a powerful means of re-igniting passions, building strong social networks, and challenging worldviews.',
    details: 'Camp Vista builds and organizes camps for young people across the world with the aim of creating an atmosphere of change through interaction — interaction with the Word of God and with other friends.',
  },
  {
    id: 'sermon-on-the-sofa',
    title: 'Sermon On The Sofa',
    icon: 'fa-couch',
    color: '#8b5cf6',
    description: 'A unique entertainment package in Secondary Schools — hilarious, edifying, and educational evangelistic events.',
    details: 'Developed in 2007, Sermon on the Sofa is a mixed-bag evangelistic event intended to reach teens through a modern, relevant, and entertaining format. Starting from Ghana in Achimota School, it has since spread to schools across multiple countries.',
  },
  {
    id: 'sportstronic',
    title: 'Sportstronic',
    icon: 'fa-futbol',
    color: '#f59e0b',
    description: 'Reaching young people through sports, games, and experiential learning methods.',
    details: 'Sportstronic believes in harnessing the abundant energies of young people through sports and games. It uses athletics and team-building activities as a platform for mentorship, discipleship, and community building.',
  },
];

// Default values for About page
export const DEFAULT_VALUES = [
  { icon: 'fa-cross', title: 'Christ-Centered', desc: 'Everything we do is rooted in the Word of God and the love of Jesus.' },
  { icon: 'fa-handshake', title: 'Community', desc: 'We believe in the power of fellowship — walking together in faith.' },
  { icon: 'fa-star', title: 'Purpose', desc: 'Every young person has a God-given gift waiting to be unlocked.' },
  { icon: 'fa-globe', title: 'Global Reach', desc: 'Our vision crosses borders — from Ghana to the world.' },
  { icon: 'fa-seedling', title: 'Growth', desc: 'We invest in spiritual, emotional, and personal development.' },
  { icon: 'fa-heart', title: 'Love', desc: 'Love Fellowship is the heartbeat of everything we do.' },
];

/**
 * Hook to fetch page content with defaults as fallback
 */
export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    cachedGet(`/content/${pageKey}`)
      .then((res) => {
        const map: PageContent = {};
        const rows = Array.isArray(res.data) ? res.data : [];
        rows.forEach((r: ContentSection) => {
          map[r.section_key] = r;
        });

        // Merge with defaults — database values override defaults
        const defaults = DEFAULT_CONTENT[pageKey] || {};
        const merged: PageContent = {};
        for (const [key, defaultVal] of Object.entries(defaults)) {
          merged[key] = map[key] || {
            id: 0,
            page_key: pageKey,
            section_key: key,
            title: defaultVal.title || '',
            body: defaultVal.body || '',
            meta: {},
          };
        }
        // Add any database sections not in defaults
        for (const [key, val] of Object.entries(map)) {
          if (!merged[key]) merged[key] = val;
        }

        setContent(merged);
      })
      .catch(() => {
        // Use all defaults on error
        const defaults = DEFAULT_CONTENT[pageKey] || {};
        const merged: PageContent = {};
        for (const [key, defaultVal] of Object.entries(defaults)) {
          merged[key] = {
            id: 0,
            page_key: pageKey,
            section_key: key,
            title: defaultVal.title || '',
            body: defaultVal.body || '',
            meta: {},
          };
        }
        setContent(merged);
      })
      .finally(() => setLoading(false));
  }, [pageKey]);

  useEffect(() => { load(); }, [load]);

  const getSection = (key: string) => content[key] || null;
  const getTitle = (key: string, fallback = '') => content[key]?.title || fallback;
  const getBody = (key: string, fallback = '') => content[key]?.body || fallback;

  return { content, loading, getSection, getTitle, getBody, reload: load };
}

/**
 * Hook to fetch ministries from database (with defaults)
 */
export function useMinistries() {
  const [ministries, setMinistries] = useState<any[]>(DEFAULT_MINISTRIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cachedGet('/content/ministries')
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        // Check if there are custom ministries stored as JSON in a 'list' section
        const listSection = rows.find((r: any) => r.section_key === 'list');
        if (listSection && listSection.body) {
          try {
            const parsed = JSON.parse(listSection.body);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMinistries(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { ministries, loading };
}
