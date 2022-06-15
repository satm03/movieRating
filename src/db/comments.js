import db from '../db.js';

export const getAllMovieComments = async (movie_id) => {
  const comments = await db('comment').select('*').where('movie_id', movie_id);
  return comments;
};

export const getCommentById = async (id) => {
  const comment = await db('comment').select('*').where({ id }).first();
  return comment;
};

export const createMovieComment = async ({ movie_id, text }) => {
  await db('comment').insert({ movie_id, text });
};

export const deleteMovieComment = async (comment) => {
  await db('comment').delete().where('id', comment.id);
};
