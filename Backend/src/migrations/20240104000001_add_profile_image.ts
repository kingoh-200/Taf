import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'profile_image');
  if (!hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.text('profile_image');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'profile_image');
  if (hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('profile_image');
    });
  }
}
