import express from 'express';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import db, {
  getAllMovies,
  getMovieById,
  getMovieByTitle,
  updateMovieById,
  getMovieByYearOfCreation,
  createMovie,
  deleteMovie,
  getAllMovieComments,
  getCommentById,
} from './db.js';
import {
  sendMoviesToAllConnections,
  sendMovieToAllConnections,
  sendDeleteMovieToAllConnections,
  sendMovieCommentsToAllConnections,
} from './websockets.js';

export const app = express();

let movieAlreadyExists = false;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    res.locals.user = await db('user').where({ token }).first();
  } else {
    res.locals.user = null;
  }

  next();
});

app.get('/', async (req, res) => {
  const movies = await getAllMovies();
  res.render('index', {
    title: 'MovieM',
    movies,
  });
});

app.get('/movieAddition', (req, res) => {
  res.render('movieAddition', {
    movieAlreadyExists,
  });
});

app.get('/detail/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  const movie = await getMovieById(id);

  const comments = await getAllMovieComments(id);

  if (!movie) return next();

  res.render('detail', {
    movie,
    comments,
  });
});

app.post('/edit/:id', async (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body.title);
  const yearOfCreation = Number(req.body.yearOfCreation);
  const director = String(req.body.director);
  const description = String(req.body.description);
  const template = String(req.body.template);
  const music = String(req.body.music);
  const screenplay = String(req.body.screenplay);

  const movie = await getMovieById(id);

  if (!movie) return next();

  await db('movie')
    .update({
    title,
    yearOfCreation,
    director,
    description,
    template,
    music,
    screenplay,
  }).where({ id });

  sendMoviesToAllConnections();
  sendMovieToAllConnections(movie.id);
  res.redirect('/');
});

app.get('/delete/:id', async (req, res, next) => {
  const id = Number(req.params.id);

  const movie = await getMovieById(id);

  if (!movie) return next();

  await deleteMovie(movie);

  sendMoviesToAllConnections();
  sendDeleteMovieToAllConnections(movie.id);
  res.redirect('/');
});

app.post('/add', async (req, res) =>{
    const title = String(req.body.title)
    const yearOfCreation = Number(req.body.yearOfCreation)
    const director = String(req.body.director)
    const description = String(req.body.description)
    const template = String(req.body.template)
    const music = String(req.body.music)
    const screenplay = String(req.body.screenplay)

    const movieTitle = await getMovieByTitle(title)

    if(movieTitle){
        const movieYear = await updateMovieById(yearOfCreation)
        if(movieYear){
            movieAlreadyExists = true
        }
        res.redirect('/movieAddition') 
    } else {
        await db('movie').insert({ title, yearOfCreation, director, description, template, music, screenplay })
        if(movieAlreadyExists){
            movieAlreadyExists = false
        }
        sendMoviesToAllConnections()
        res.redirect('/') 
    }    
})

app.post('/addComment/:id', async (req, res) => {
  const text = String(req.body.newComment);
  const movie_id = Number(req.params.id);

  await db('comment').insert({ movie_id, text });
  sendMovieCommentsToAllConnections(movie_id);
  res.redirect('back');
});

app.get('/deleteComment/:comment_id', async (req, res, next) => {
  const comment_id = Number(req.params.comment_id);

  const comment = await getCommentById(comment_id);
  console.log(comment);

  if (!comment) return next();

  await db('comment').delete().where('id', comment_id);

  sendMovieCommentsToAllConnections(comment.movie_id);

  res.redirect('back');
});

app.get('/login', (req, res) => {
  res.render('loginPage');
});

app.get('/registration', (req, res) => {
  res.render('registrationPage');
});

app.post('/register', async (req, res) => {
  try {
    const email = req.body.email;
    const nickname = req.body.nickname;
    const password = req.body.password;

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    const token = crypto.randomBytes(16).toString('hex');

    const ids = await db('user').insert({ nickname, email, salt, hash, token });

    const user = await db('user').where('id', ids[0]).first();

    res.cookie('token', user.token);

    res.redirect('/');
  } catch (e) {
    res.render('registrationPage', {
      error: 'Registrace se nepovedla',
    });
  }
});

app.post('/signin', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await db('user').where({ email }).first();
  if (!user) return null;

  const salt = user.salt;
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  if (hash !== user.hash) return null;

  if (user) {
    res.cookie('token', user.token);

    res.redirect('/');
  } else {
    res.render('login', {
      error: 'Chybné jméno nebo heslo',
    });
  }
});

app.get('/logout', (req, res) => {
  res.cookie('token', undefined);

  res.redirect('back');
});

app.use((req, res) => {
  res.status(404);
  res.send('404 - Not found');
});
