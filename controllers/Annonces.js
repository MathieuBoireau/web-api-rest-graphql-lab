'use strict';

var utils = require('../utils/writer.js');
var Annonces = require('../service/AnnoncesService');
const { authorizeAgent } = require('../auth')

module.exports.deleteAnnonce = function deleteAnnonce (req, res, next, annonceId) {
  try {
    authorizeAgent(req, res, next);
  } catch (err) {
    res.statusCode = err.code;
    res.end(err.message);
    return;
  }
  Annonces.deleteAnnonce(annonceId)
    .then(function (response) {
      utils.writeJson(res, response);
    })
};

module.exports.getAnnonce = function getAnnonce (req, res, next, annonceId) {
  const isAgent = req.auth?.user.permission === "agent";
  Annonces.getAnnonce(annonceId, { isAgent, select: { photos: 0 } })
    .then(function (response) {
      utils.writeJson(res, response);
    })
};

module.exports.getAnnonces = function getAnnonces (req, res, next) {
  const isAgent = req.auth?.user.permission === "agent";
  Annonces.getAnnonces({ isAgent, select: { photos: 0 } })
    .then(function (response) {
      utils.writeJson(res, response);
    })
};

module.exports.getImage = function getImage (req, res, next, annonceId, n) {
  Annonces.getImage(annonceId, n)
    .then(function (photo) {
      res.end(photo, 'binary');
    })
    .catch(function (response) {
      res.statusCode = 404;
      res.end();
    });
};

module.exports.postAnnonces = function postAnnonces (req, res, next) {
  try {
    authorizeAgent(req, res, next);
  } catch (err) {
    res.statusCode = err.code;
    res.end(err.message);
    return;
  }
  Annonces.postAnnonces(req)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.putAnnonce = function putAnnonce (req, res, next, body, annonceId) {
  try {
    authorizeAgent(req, res, next);
  } catch (err) {
    res.statusCode = err.code;
    res.end(err.message);
    return;
  }
  Annonces.putAnnonce(annonceId, req)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
