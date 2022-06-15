import ejs from 'ejs';
import { WebSocketServer, WebSocket } from 'ws';
import { getAllMovies, getMovieById } from './db/movies.js';
import { getAllMovieComments } from './db/comments.js';

/** @type {Set<WebSocket>} */
const connections = new Set();

export const createWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    connections.add(ws);

    ws.on('close', () => {
      connections.delete(ws);
    });
  });
};

export const sendMoviesToAllConnections = async () => {
  const movies = await getAllMovies();

  const html = await ejs.renderFile('views/_movies.ejs', {
    movies,
  });

  for (const connection of connections) {
    const message = {
      type: 'movies',
      html,
    };

    const json = JSON.stringify(message);

    connection.send(json);
  }
};

export const sendMovieToAllConnections = async (movie_id) => {
  const movie = await getMovieById(movie_id);

  const html = await ejs.renderFile('views/_movie.ejs', {
    movie,
  });

  for (const connection of connections) {
    const message = {
      type: 'movie',
      id: movie_id,
      html,
    };

    const json = JSON.stringify(message);

    connection.send(json);
  }
};

export const sendDeleteMovieToAllConnections = async (movie_id) => {
  for (const connection of connections) {
    const message = {
      type: 'delete',
      id: movie_id,
    };

    const json = JSON.stringify(message);

    connection.send(json);
  }
};

export const sendMovieCommentsToAllConnections = async (movie_id) => {
  const comments = await getAllMovieComments(movie_id);

  const html = await ejs.renderFile('views/_comments.ejs', {
    comments,
  });

  for (const connection of connections) {
    const message = {
      type: 'comments',
      html,
    };

    const json = JSON.stringify(message);

    connection.send(json);
  }
};
