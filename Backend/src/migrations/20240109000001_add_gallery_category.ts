import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasCategory = await knex.schema.hasColumn('gallery_items', 'category');
  if (!hasCategory) {
    await knex.schema.alterTable('gallery_items', (table) => {
      table.string('category', 50).defaultTo('general');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasCategory = await knex.schema.hasColumn('gallery_items', 'category');
  if (hasCategory) {
    await knex.schema.alterTable('gallery_items', (table) => {
      table.dropColumn('category');
    });
  }
}
