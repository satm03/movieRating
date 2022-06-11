/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.createTable('comment', (table) => {
    table.increments('id').primary()
    table.integer('movie_id').references('id').inTable('movie').onDelete('CASCADE')
    table.string('text')
    table.timestamps(true, true)
  }) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.dropTable('comment')
};
