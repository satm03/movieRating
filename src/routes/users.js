import express from 'express';
import { createUser, getUser } from '../db/users.js';

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('loginPage');
});

router.get('/registration', (req, res) => {
  res.render('registrationPage');
});

router.post('/register', async (req, res) => {
  try {
    const nickname = req.body.nickname;
    const email = req.body.email;
    const password = req.body.password;

    const user = await createUser(nickname, email, password);

    res.cookie('token', user.token);

    res.redirect('/');
  } catch (e) {
    res.render('registrationPage', {
      error: 'Uživatel s daným emailem, nebo přezdívkou již existuje.',
    });
  }
});

router.post('/signin', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await getUser(email, password);

  if (user) {
    res.cookie('token', user.token);

    res.redirect('/');
  } else {
    res.render('loginPage', {
      error: 'Chybné jméno nebo heslo.',
    });
  }
});

router.get('/logout', (req, res) => {
  res.cookie('token', undefined);

  res.redirect('back');
});

export default router;
