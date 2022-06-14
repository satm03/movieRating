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
}, id) => {
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

export const createMovieComment = async ({movie_id, text}) => {
  await db('comment').insert({ movie_id, text });
};

export const deleteMovieComment = async (comment) => {
  await db('comment').delete().where('id', comment.id);
};

export const createUser = async (nickname, email, password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  const token = crypto.randomBytes(16).toString('hex');

  const ids = await db('user').insert({ nickname, email, salt, hash, token });

  const user = await db('user').where('id', ids[0]).first();

  return user
}

export const getUserByToken = async (token) => {
  const user = await db('user').where({ token }).first();
  return user;
};

export const getUser = async (email, password) => {
  const user = await db('user').where({ email }).first();
  if (!user) return null

  const salt = user.salt
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  if (hash !== user.hash) return null

  return user
}