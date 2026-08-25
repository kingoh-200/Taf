import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Gallery items (images and videos)
  const itemsExist = await knex.schema.hasTable('gallery_items');
  if (!itemsExist) {
    await knex.schema.createTable('gallery_items', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('type', 20).notNullable().defaultTo('image'); // 'image' or 'video'
      table.text('url').notNullable();
      table.text('thumbnail_url');
      table.string('caption', 500);
      table.integer('like_count').defaultTo(0);
      table.integer('save_count').defaultTo(0);
      table.timestamps(true, true);
    });
  }

  // Gallery likes (one per user per item)
  const likesExist = await knex.schema.hasTable('gallery_likes');
  if (!likesExist) {
    await knex.schema.createTable('gallery_likes', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('item_id').unsigned().references('id').inTable('gallery_items').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['user_id', 'item_id']);
    });
  }

  // Gallery saves (bookmarks)
  const savesExist = await knex.schema.hasTable('gallery_saves');
  if (!savesExist) {
    await knex.schema.createTable('gallery_saves', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('item_id').unsigned().references('id').inTable('gallery_items').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['user_id', 'item_id']);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('gallery_saves');
  await knex.schema.dropTableIfExists('gallery_likes');
  await knex.schema.dropTableIfExists('gallery_items');
}
