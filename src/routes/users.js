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
    const nickname = String(req.body.nickname).replace(/^\s+(?=\S)|\s+$/gm, '');
    const email = String(req.body.email).replace(/^\s+(?=\S)|\s+$/gm, '');
    const password = String(req.body.password).replace(/^\s+(?=\S)|\s+$/gm, '');

    if (
      nickname.length == 0 ||
      email == 0 ||
      password == 0
    ) {
      res.render('registrationPage', {
        error:
          'Vyplňte prosím validní hodnoty.',
      });
      return;
    }

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
