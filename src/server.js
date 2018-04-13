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

const getTargetPost = (results, acceptedAnswerID) => {
  let currPost = results.shift();

  while (currPost.soID === acceptedAnswerID) {
    currPost = results.shift();
  }

  return currPost;
};

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
  const result = await Post.find({ parentID: null })
    .or([{ score: { $gt: 5000 } }, { 'user.reputation': { $gt: 200000 } }])
    .where('tags')
    .in(['jquery']);

  res.send(result);
});

const sendAnswers = R.curry((res, answers) => {
  res.send(answers);
});

const flattenAnswers = answers => R.flatten(answers);

const getAnswers = ({ soID }) => Post.find({ parentID: soID });

const findAnswers = questions => Promise.all(R.map(getAnswers, questions));

const findQuestions = req =>
  Post.find({ parentID: null })
    .where('tags')
    .in(['npm']);

const handleNpmAnswersQuery = (req, res) =>
  R.pipeP(findQuestions, findAnswers, flattenAnswers, sendAnswers(res))(req);

server.get('/npm-answers', async (req, res) => {
  await handleNpmAnswersQuery(req, res);
});

module.exports = { server };
