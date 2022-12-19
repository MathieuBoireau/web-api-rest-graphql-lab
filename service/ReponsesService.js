'use strict';

const { Annonce } = require('../db/schema/annonce');

/**
 * Ajoute une réponse
 * Répond à une question pour une annonce
 *
 * annonceId String Id de l'annonce
 * n Integer Numéro (indice) de la question
 * no response value expected for this operation
 **/
exports.postReponse = function(annonceId, n, req) {
  return new Promise(async function(resolve, reject) {
    const annonce = await Annonce.findById(annonceId);
    if(annonce.questions.length <= n || annonce.questions[n].answer.title != null){
      reject();
    }else{
      resolve(
        Annonce.findByIdAndUpdate(
          annonceId,
          {
            $set: {
              [`questions.${n}.answer`]: {
                title: req.body.title,
                author: req.auth.user.displayName,
              },
            },
          },
          { returnOriginal: false }
        )
      );
    }
  });
}

