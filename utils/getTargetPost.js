module.exports = (results, acceptedAnswerID) => {
  let currPost = results.shift();

  while (currPost.soID === acceptedAnswerID) {
    currPost = results.shift();
  }

  return currPost;
};
