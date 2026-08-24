export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Member {
  id: number;
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  profile_image: string | null;
  password_hash: string;
  role: string;
  created_at: string;
}
