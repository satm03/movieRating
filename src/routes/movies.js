import express from 'express';
import auth from '../middlewares/auth.js';
import {
  getMovieById,
  getMovieByTitle,
  updateMovieById,
  getMovieByYearOfCreation,
  createMovie,
  deleteMovie,
} from '../db/movies.js';
import { getAllMovieComments } from '../db/comments.js';
import {
  sendMoviesToAllConnections,
  sendMovieToAllConnections,
  sendDeleteMovieToAllConnections,
} from '../websockets.js';

const router = express.Router();

let movieAlreadyExists = false;

router.get('/movieAddition', auth, (req, res) => {
  res.render('movieAddition', {
    movieAlreadyExists,
  });
});

router.get('/detail/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  const movie = await getMovieById(id);

  const comments = await getAllMovieComments(id);

  if (!movie) return next();

  res.render('detail', {
    movie,
    comments,
  });
});

router.post('/edit/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body.title);
  const yearOfCreation = Number(req.body.yearOfCreation);
  const director = String(req.body.director);
  const description = String(req.body.description);
  const template = String(req.body.template);
  const music = String(req.body.music);
  const screenplay = String(req.body.screenplay);

  console.log(title.length);
  console.log(yearOfCreation);
  console.log(director.length);
  console.log(description.length);

  const movie = await getMovieById(id);

  if (!movie) return next();

  await updateMovieById(
    {
      title,
      yearOfCreation,
      director,
      description,
      template,
      music,
      screenplay,
    },
    id
  );

  sendMoviesToAllConnections();
  sendMovieToAllConnections(movie.id);
  res.redirect('/');
});

router.get('/delete/:id', auth, async (req, res, next) => {
  const id = Number(req.params.id);

  const movie = await getMovieById(id);

  if (!movie) return next();

  await deleteMovie(movie);

  sendMoviesToAllConnections();
  sendDeleteMovieToAllConnections(movie.id);
  res.redirect('/');
});

router.post('/add', auth, async (req, res) => {
  const title = String(req.body.title);
  const yearOfCreation = Number(req.body.yearOfCreation);
  const director = String(req.body.director);
  const description = String(req.body.description);
  const template = String(req.body.template);
  const music = String(req.body.music);
  const screenplay = String(req.body.screenplay);
  console.log(title.length);
  console.log(yearOfCreation);
  console.log(screenplay.length);

  const movieByTitle = await getMovieByTitle(title);
  const movieByYear = await getMovieByYearOfCreation(yearOfCreation);

  if (movieByTitle && movieByYear) {
    movieAlreadyExists = true;
    res.redirect('/movieAddition');
  } else {
    await createMovie({
      title,
      yearOfCreation,
      director,
      description,
      template,
      music,
      screenplay,
    });
    if (movieAlreadyExists) {
      movieAlreadyExists = false;
    }
    sendMoviesToAllConnections();
    res.redirect('/');
  }
});

export default router;
