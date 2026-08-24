import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('role', 50).notNullable().defaultTo('member');
    table.timestamps(true, true);
  });

  // Events table
  await knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('description');
    table.timestamp('event_date').notNullable();
    table.string('location', 255);
    table.string('image_url', 500);
    table.timestamps(true, true);
  });

  // Members table
  await knex.schema.createTable('members', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('role', 100);
    table.text('bio');
    table.string('image_url', 500);
    table.timestamps(true, true);
  });

  // Announcements table
  await knex.schema.createTable('announcements', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.boolean('is_pinned').defaultTo(false);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('announcements');
  await knex.schema.dropTableIfExists('members');
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('users');
}
