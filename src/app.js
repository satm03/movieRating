import express from 'express';
import cookieParser from 'cookie-parser';

import movieRouter from './routes/movies.js';
import commentsRouter from './routes/comments.js';
import usersRouter from './routes/users.js';

import loadUser from './middlewares/loadUser.js';

import { getAllMovies } from './db/movies.js';

export const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(loadUser);

app.get('/', async (req, res) => {
  const movies = await getAllMovies();
  res.render('index', {
    title: 'MovieM',
    movies,
  });
});

app.use(movieRouter);
app.use(commentsRouter);
app.use(usersRouter);

app.use((req, res) => {
  res.status(404);
  res.send('404 - Not found');
});
