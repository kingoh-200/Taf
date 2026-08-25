import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add fields to users table
  const usersExists = await knex.schema.hasColumn('users', 'title');
  if (!usersExists) {
    await knex.schema.alterTable('users', (table) => {
      table.string('title', 255);
      table.string('department', 255);
      table.string('location', 255);
      table.text('skills');
      table.string('social_link', 500);
      table.boolean('is_active').defaultTo(true);
    });
  }

  // Add fields to members table
  const membersExists = await knex.schema.hasColumn('members', 'title');
  if (!membersExists) {
    await knex.schema.alterTable('members', (table) => {
      table.string('title', 255);
      table.string('department', 255);
      table.string('location', 255);
      table.text('skills');
      table.string('social_link', 500);
      table.boolean('is_active').defaultTo(true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('title');
    table.dropColumn('department');
    table.dropColumn('location');
    table.dropColumn('skills');
    table.dropColumn('social_link');
    table.dropColumn('is_active');
  });

  await knex.schema.alterTable('members', (table) => {
    table.dropColumn('title');
    table.dropColumn('department');
    table.dropColumn('location');
    table.dropColumn('skills');
    table.dropColumn('social_link');
    table.dropColumn('is_active');
  });
}
