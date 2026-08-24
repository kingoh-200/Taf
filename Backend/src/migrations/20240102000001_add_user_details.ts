import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'name');
  if (!hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.string('name', 255);
      table.string('email', 255).unique();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('users', 'name');
  if (hasColumn) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('name');
      table.dropColumn('email');
    });
  }
}
