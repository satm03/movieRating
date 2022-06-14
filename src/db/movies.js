import db from '../db.js';

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