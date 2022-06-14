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
  createMovieComment,
  deleteMovieComment,
  createUser,
  getUser,
  getUserByToken
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
    res.locals.user = await getUserByToken (token);
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

  console.log(title.length)
  console.log(yearOfCreation)
  console.log(director.length)
  console.log(description.length)

  const movie = await getMovieById(id);

  if (!movie) return next();

  await updateMovieById({
    title,
    yearOfCreation,
    director,
    description,
    template,
    music,
    screenplay,
  }, id)

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
    console.log(title.length)
    console.log(yearOfCreation)
    console.log(screenplay.length)

    const movieByTitle = await getMovieByTitle(title)
    const movieByYear = await getMovieByYearOfCreation(yearOfCreation)

    if(movieByTitle && movieByYear){
        movieAlreadyExists = true
        res.redirect('/movieAddition') 
    } else {
        await createMovie({ title, yearOfCreation, director, description, template, music, screenplay })
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
  if(text.length > 0){
    await createMovieComment({ movie_id, text });
    sendMovieCommentsToAllConnections(movie_id);
  }
  res.redirect('back');
});

app.get('/deleteComment/:comment_id', async (req, res, next) => {
  const comment_id = Number(req.params.comment_id);

  const comment = await getCommentById(comment_id);
  console.log(comment);

  if (!comment) return next();

  await deleteMovieComment(comment);

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
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    const user = await createUser(nickname, email, password)

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

  const user = await getUser(email, password)

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
