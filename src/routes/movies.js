import express from 'express';
import auth from '../middlewares/auth.js';
import {
  getMovieById,
  updateMovieById,
  getMovieByTitleAndYearOfCreation,
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

router.get('/movieAddition', auth, (req, res) => {
  res.render('movieAddition');
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
  const title = String(req.body.title).replace(/^\s+(?=\S)|\s+$/g, '');
  const yearOfCreation = Number(req.body.yearOfCreation);
  const director = String(req.body.director).replace(/^\s+(?=\S)|\s+$/g, '');
  const description = String(req.body.description).replace(
    /^\s+(?=\S)|\s+$/g,
    ''
  );
  const template = String(req.body.template).replace(/^\s+(?=\S)|\s+$/g, '');
  const music = String(req.body.music).replace(/^\s+(?=\S)|\s+$/g, '');
  const screenplay = String(req.body.screenplay).replace(
    /^\s+(?=\S)|\s+$/g,
    ''
  );

  const movie = await getMovieById(id);

  if (!movie) return next();

  if (
    title.length == 0 ||
    yearOfCreation == NaN ||
    yearOfCreation == 0 ||
    director.length == 0 ||
    description.length == 0
  ) {
    res.redirect('back');
    return;
  }

  const existingMovie = await getMovieByTitleAndYearOfCreation(
    title,
    yearOfCreation
  );

  if (existingMovie) {
    res.redirect('back');
    return;
  }

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
  const title = String(req.body.title).replace(/^\s+(?=\S)|\s+$/g, '');
  const yearOfCreation = Number(req.body.yearOfCreation);
  const director = String(req.body.director).replace(/^\s+(?=\S)|\s+$/gm, '');
  const description = String(req.body.description).replace(
    /^\s+(?=\S)|\s+$/gm,
    ''
  );
  const template = String(req.body.template).replace(/^\s+(?=\S)|\s+$/gm, '');
  const music = String(req.body.music).replace(/^\s+(?=\S)|\s+$/gm, '');
  const screenplay = String(req.body.screenplay).replace(
    /^\s+(?=\S)|\s+$/gm,
    ''
  );

  if (
    title.length == 0 ||
    yearOfCreation == NaN ||
    yearOfCreation == 0 ||
    director.length == 0 ||
    description.length == 0
  ) {
    res.render('movieAddition', {
      error:
        'Prosím vyplňte validní hodnoty pro název filmu, rok natočení, režii a stručný popis.',
    });
    return;
  }

  const existingMovie = await getMovieByTitleAndYearOfCreation(
    title,
    yearOfCreation
  );

  if (existingMovie) {
    res.render('movieAddition', {
      error: 'Tento film již v MovieM existuje.',
    });
  } else {
    try {
      await createMovie({
        title,
        yearOfCreation,
        director,
        description,
        template,
        music,
        screenplay,
      });
      sendMoviesToAllConnections();
      res.redirect('/');
    } catch (e) {
      res.render('movieAddition', {
        error: 'Neuvedli jste validní hodnoty prosím zkuste znova.',
      });
    }
  }
});

export default router;
