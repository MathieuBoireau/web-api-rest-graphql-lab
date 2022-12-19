'use strict';

var utils = require('../utils/writer.js');
var Reponses = require('../service/ReponsesService');
const { authorizeAgent } = require('../auth')

module.exports.postReponse = function postReponse (req, res, next, body, annonceId, n) {
  try {
    authorizeAgent(req, res, next);
  } catch (err) {
    res.statusCode = err.code;
    res.end(err.message);
    return;
  }
  Reponses.postReponse(annonceId, n, req)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
