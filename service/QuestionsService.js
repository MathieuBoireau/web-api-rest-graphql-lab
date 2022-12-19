'use strict';

const { Annonce } = require('../db/schema/annonce');


/**
 * Ajoute une question
 * Pose une question pour une annonce
 *
 * annonceId ObjectId Id de l'annonce
 * no response value expected for this operation
 **/
exports.postQuestion = function(annonceId, req) {
  return new Promise(function(resolve, reject) {
    resolve(
      Annonce.findByIdAndUpdate(
        annonceId,
        {
          $push: {
            questions: {
              title: req.body.title,
              author: req.auth.user.displayName,
            },
          },
        },
        { returnOriginal: false }
      )
    );
  });
}

