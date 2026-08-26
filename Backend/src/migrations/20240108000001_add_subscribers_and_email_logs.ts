import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Newsletter subscribers
  if (!(await knex.schema.hasTable('newsletter_subscribers'))) {
    await knex.schema.createTable('newsletter_subscribers', (table) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('name');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // Email logs (track mass mails sent by admin)
  if (!(await knex.schema.hasTable('email_logs'))) {
    await knex.schema.createTable('email_logs', (table) => {
      table.increments('id').primary();
      table.integer('sent_by').unsigned().references('id').inTable('users');
      table.string('subject').notNullable();
      table.text('body').notNullable();
      table.integer('recipient_count').defaultTo(0);
      table.string('status').defaultTo('sent'); // sent, failed, partial
      table.timestamps(true, true);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('email_logs');
  await knex.schema.dropTableIfExists('newsletter_subscribers');
}
