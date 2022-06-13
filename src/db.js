import knex from 'knex';
import knexfile from '../knexfile.js';
import crypto from 'crypto';

const db = knex(knexfile[process.env.NODE_ENV || 'development']);

export default db;

export const getAllMovies = async () => {
  const movies = await db('movie').select('*');
  return movies;
};

export const getMovieById = async (id) => {
  const movie = await db('movie').select('*').where({ id }).first();
  return movie;
};

export const getMovieByTitle = async (title) => {
  const movie = await db('movie').select('*').where({ title }).first();
  return movie;
};

export const getMovieByYearOfCreation = async (yearOfCreation) => {
  const movie = await db('movie').select('*').where({ yearOfCreation }).first();
  return movie;
};

export const updateMovieById = async ({
  title,
  yearOfCreation,
  director,
  description,
  template,
  music,
  screenplay,
}) => {
  await db('movie')
    .update({
      title,
      yearOfCreation,
      director,
      description,
      template,
      music,
      screenplay,
    })
    .where({ id });
};

export const createMovie = async ({
  title,
  yearOfCreation,
  director,
  description,
  template,
  music,
  screenplay,
}) => {
  await db('movie').insert({
    title,
    yearOfCreation,
    director,
    description,
    template,
    music,
    screenplay,
  });
};

export const deleteMovie = async (movie) => {
  await db('movie').delete().where('id', movie.id);
};

export const getAllMovieComments = async (movie_id) => {
  const comments = await db('comment').select('*').where('movie_id', movie_id);
  return comments;
};

export const getCommentById = async (id) => {
  const comment = await db('comment').select('*').where({ id }).first();
  return comment;
};
