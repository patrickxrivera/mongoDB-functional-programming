const Post = require('../src/post.js');

const to = require('./to');

const find = key => value => to(Post.findOne({ [key]: value }));

const findSoID = find('soID');

module.exports = findSoID;
