import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('announcements').del();
  await knex('members').del();
  await knex('events').del();
  await knex('users').del();

  // Seed admin user (password: "admin123")
  const passwordHash = await bcrypt.hash('admin123', 10);
  await knex('users').insert([
    { username: 'admin', password_hash: passwordHash, role: 'admin' },
  ]);

  // Seed events
  await knex('events').insert([
    {
      title: 'Welcome Meeting',
      description: 'Kickoff meeting for the new semester. Meet the team and learn about upcoming activities!',
      event_date: new Date('2025-09-15T14:00:00'),
      location: 'Room 201, Main Building',
    },
    {
      title: 'Hackathon 2025',
      description: '48-hour coding marathon. Form teams and build something awesome!',
      event_date: new Date('2025-10-20T09:00:00'),
      location: 'Computer Lab A',
    },
    {
      title: 'End of Year Party',
      description: 'Celebrate our achievements with food, games, and awards!',
      event_date: new Date('2025-12-10T18:00:00'),
      location: 'Student Center',
    },
  ]);

  // Seed members
  await knex('members').insert([
    {
      name: 'Alice Johnson',
      role: 'President',
      bio: 'Computer Science senior. Passionate about web development and open source.',
      image_url: null,
    },
    {
      name: 'Bob Smith',
      role: 'Vice President',
      bio: 'Engineering junior. Loves building robots and playing chess.',
      image_url: null,
    },
    {
      name: 'Carol Williams',
      role: 'Treasurer',
      bio: 'Business major. Keeps the club funded and organized.',
      image_url: null,
    },
  ]);

  // Seed announcements
  await knex('announcements').insert([
    {
      title: 'New Semester, New Opportunities!',
      content: 'Welcome back everyone! We have exciting plans for this semester including workshops, hackathons, and guest speakers. Stay tuned for more details.',
      is_pinned: true,
    },
    {
      title: 'Meeting Rescheduled',
      content: 'This week\'s meeting has been moved from Thursday to Friday at 3 PM due to a schedule conflict. See you there!',
      is_pinned: false,
    },
  ]);
}
