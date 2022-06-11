/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.createTable('movie', (table) => {
    table.increments('id').primary()
    table.string('title').unique({indexName:'movie_unqiue_name'}).notNullable
    table.integer('yearOfCreation').notNullable
    table.string('director').notNullable
    table.string('description').notNullable
    table.string('template')
    table.string('music')
    table.string('screenplay')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.dropTable('movie')
};
