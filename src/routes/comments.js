import express from 'express';
import {
  getCommentById,
  createMovieComment,
  deleteMovieComment,
} from '../db/comments.js';
import { sendMovieCommentsToAllConnections } from '../websockets.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/addComment/:id', auth, async (req, res) => {
  const text = String(req.body.newComment);
  const movie_id = Number(req.params.id);
  if (text.length > 0) {
    await createMovieComment({ movie_id, text });
    sendMovieCommentsToAllConnections(movie_id);
  }
  res.redirect('back');
});

router.get('/deleteComment/:comment_id', auth, async (req, res, next) => {
  const comment_id = Number(req.params.comment_id);

  const comment = await getCommentById(comment_id);

  if (!comment) return next();

  await deleteMovieComment(comment);

  sendMovieCommentsToAllConnections(comment.movie_id);

  res.redirect('back');
});

export default router;
