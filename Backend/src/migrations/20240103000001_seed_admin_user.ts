import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function up(knex: Knex): Promise<void> {
  const existing = await knex('users').where({ username: 'ADMIN' }).first();

  if (!existing) {
    const password_hash = await bcrypt.hash('123456', 10);
    await knex('users').insert({
      username: 'ADMIN',
      password_hash,
      name: 'Admin',
      email: 'kingoina254@gmail.com',
      role: 'admin',
    });
  } else {
    // Update existing user to ensure correct role and email
    await knex('users').where({ username: 'ADMIN' }).update({
      email: 'kingoina254@gmail.com',
      role: 'admin',
      name: 'Admin',
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').where({ username: 'ADMIN' }).del();
}
