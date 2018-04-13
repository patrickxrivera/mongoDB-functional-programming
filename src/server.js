const bodyParser = require('body-parser');
const express = require('express');
const R = require('ramda');

const findSoID = require('../utils/find');
const getTargetPost = require('../utils/getTargetPost');
const { handleNoPostError, handleIDError } = require('../utils/handleError');

const handlePopJqueryQstnsQuery = require('../controllers/popularJqueryQuestions');
const handleNpmAnswersQuery = require('../controllers/npmAnswers');
const Post = require('./post.js');

const server = express();

// to enable parsing of json bodies for post requests
server.use(bodyParser.json());

server.get('/accepted-answer/:soID', async ({ params }, res) => {
  const [idErr, originalPost] = await findSoID(params.soID);

  if (idErr) return handleIDError(res);

  const { acceptedAnswerID } = originalPost;

  const [noPostErr, acceptedAnswerPost] = await findSoID(acceptedAnswerID);

  if (noPostErr || R.isNil(acceptedAnswerPost)) return handleNoPostError(res);

  res.send(acceptedAnswerPost);
});

server.get('/top-answer/:soID', async ({ params }, res) => {
  const [idErr, originalPost] = await findSoID(params.soID);

  if (idErr) return handleIDError(res);

  const { acceptedAnswerID } = originalPost;

  if (R.isNil(acceptedAnswerID)) return handleNoPostError(res);

  const results = await Post.find({ parentID: params.soID }).sort('-score');

  const targetPost = getTargetPost(results, acceptedAnswerID);

  res.send(targetPost);
});

server.get('/popular-jquery-questions', async (req, res) => {
  await handlePopJqueryQstnsQuery(req, res);
});

server.get('/npm-answers', async (req, res) => {
  await handleNpmAnswersQuery(req, res);
});

module.exports = { server };
