'use strict';

var utils = require('../utils/writer.js');
var Questions = require('../service/QuestionsService');
const { authorizeUser } = require('../auth')

module.exports.postQuestion = function postQuestion (req, res, next, body, annonceId) {
  try {
    authorizeUser(req, res, next);
  } catch (err) {
    res.statusCode = err.code;
    res.end(err.message);
    return;
  }
  Questions.postQuestion(annonceId, req)
    .then(function (response) {
      utils.writeJson(res, response);
    })
};
