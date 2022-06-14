import crypto from 'crypto';
import db from '../db.js';

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