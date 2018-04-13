const R = require('ramda');

const Post = require('../src/post.js');

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

module.exports = handleNpmAnswersQuery;
