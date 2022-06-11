/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.createTable('user', (table) => {
      table.increments('id').primary()
      table.string('nickname').unique({indexName:'user_unqiue_nickname'}).notNullable()
      table.string('email').unique({indexName:'user_unqiue_email'}).notNullable()
      table.string('salt').notNullable()
      table.string('hash').notNullable()
      table.string('token')
  })
  await knex.schema.alterTable('comment', (table) =>{
      table.integer('user_id').references('id').inTable('user').onDelete('NO ACTION')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.dropTable('user')
  await knex.schema.alterTable('comment', (table) => {
      table.dropColumn('user_id')
  })
};
