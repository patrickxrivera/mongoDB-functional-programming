const bodyParser = require('body-parser');
const express = require('express');
const R = require('ramda');

const Post = require('./post.js');

const USER_ERROR = 422;

const server = express();
// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

const to = promise =>
  promise
    .then((data) => {
      return [null, data];
    })
    .catch(err => [err]);

const find = key => value => to(Post.findOne({ [key]: value }));

const findSoID = find('soID');

const handleUserError = error => res => res.status(USER_ERROR).send({ error });

const handleNoPostError = handleUserError('Post unavailable');

const handleIDError = handleUserError('Invalid ID');

server.get('/accepted-answer/:soID', async ({ params }, res) => {
  const [idErr, originalPost] = await findSoID(params.soID);

  if (idErr) return handleIDError(res);

  const { acceptedAnswerID } = originalPost;

  const [noPostErr, acceptedAnswerPost] = await findSoID(acceptedAnswerID);

  if (noPostErr) return handleNoPostError(res);

  res.send(acceptedAnswerPost);
});

module.exports = { server };
