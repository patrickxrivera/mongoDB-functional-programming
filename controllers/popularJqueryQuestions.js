const R = require('ramda');

const Post = require('../src/post.js');

const sendQuestions = R.curry((res, questions) => {
  res.send(questions);
});

const findQuestions = req =>
  Post.find({ parentID: null })
    .or([{ score: { $gt: 5000 } }, { 'user.reputation': { $gt: 200000 } }])
    .where('tags')
    .in(['jquery']);

const handlePopJqueryQstnsQuery = (req, res) =>
  R.pipeP(findQuestions, sendQuestions(res))(req);

module.exports = handlePopJqueryQstnsQuery;
