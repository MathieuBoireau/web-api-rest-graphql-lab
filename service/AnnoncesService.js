'use strict';
const { Annonce, createAnnonce } = require('../db/schema/annonce');

/**
 * Supprime l'annonce
 * Supprime l'annonce correspondant à l'id
 *
 * annonceId ObjectId Id de l'annonce à supprimer
 * no response value expected for this operation
 **/
exports.deleteAnnonce = function (annonceId) {
  return new Promise(function (resolve, reject) {
    resolve(Annonce.findByIdAndDelete(annonceId));
  });
}


/**
 * Obtient une annonce
 * Retourne l'annonce correspondant à l'id
 *
 * annonceId ObjectId Id de l'annonce à obtenir
 * returns Annonce
 **/
exports.getAnnonce = function (annonceId, options) {
  return new Promise(function (resolve, reject) {
    Annonce.findById(annonceId, {}, {}, function (error, annonce) {
      if (!options.isAgent && annonce.publication_status === "non publiée") {
        resolve(null);
      } else {
        resolve(annonce);
      }
    }).select(options.select);
  });
}


/**
 * Obtient les annonces
 * Retourne toutes les annonces immobilières
 *
 * returns List
 **/
exports.getAnnonces = function (options) {
  return new Promise(function (resolve, reject) {
    Annonce.find({}, {}, function (error, annonces) {
      if (options.isAgent) {
        resolve(annonces);
      } else {
        resolve(annonces.filter(annonce => annonce.publication_status === "publiée"))
      }
    }).select(options.select)
  });
}


/**
 * Obtient l'image d'une annonce
 * Retourne une image d'une annonce si elle existe
 *
 * annonceId ObjectId Id de l'annonce
 * n Integer Numéro de l'image à obtenir
 * returns byte[]
 **/
exports.getImage = function (annonceId, n) {
  return new Promise(function (resolve, reject) {
    Annonce.findById(annonceId, {}, {}, function(error, annonce) {
      if (annonce.photos && n > 0 && n <= annonce.photos.length) {
        const photo = annonce.photos[n - 1];
        resolve(Buffer.from(photo.buffer));
      } else {
        reject();
      }
    });
  });
}


/**
 * Ajoute une annonce
 * Crée une nouvelle annonce
 *
 * no response value expected for this operation
 **/
exports.postAnnonces = function (req) {
  return new Promise(function (resolve, reject) {
    let title = req.body.title;
    let type = req.body.type;
    let publication_status =
      req.body.publication_status === undefined ? 'non publiée' : 'publiée';
    let status = req.body.status;
    let description = req.body.description;
    let price = req.body.price;
    req.body.date = req.body.date == '' ? '' : new Date(req.body.date);
    let date = req.body.date;
    let photos = req.files?.map((file) => file.buffer);
    req.body.photos = photos;
    const errors = {
      title: title == '',
      type: type == undefined,
      status: status == '',
      description: description == '',
      price: price == '',
      date: date == '',
    };
    if (Object.values(errors).includes(true)) {
      reject();
    } else {
      resolve(createAnnonce(
        title,
        type,
        publication_status,
        status,
        description,
        price,
        date,
        photos
      ));
    }
  });
}


/**
 * Met à jour une annonce
 * Met à jour l'annonce correspondant à l'id
 *
 * annonceId ObjectId Id de l'annonce à mettre à jour
 * returns AnnonceUpdate
 **/
exports.putAnnonce = function (annonceId, req) {
  return new Promise(function (resolve, reject) {
    let title = req.body.title;
    let type = req.body.type;
    let status = req.body.status;
    if (!req.body.publication_status)
      req.body.publication_status = 'non publiée';
    let description = req.body.description;
    let price = req.body.price;
    let date = req.body.date;
    let photos = req.files?.map((file) => file.buffer);
    req.body.photos = photos;
    const errors = {
      title: title == '',
      type: type == '',
      status: status == '',
      description: description == '',
      price: price == '',
      date: date == '',
    };
    if (Object.values(errors).includes(true)) {
      reject();
    } else {
      resolve(Annonce.findByIdAndUpdate(annonceId, req.body, {
        returnOriginal: false
      }));
    }
  });
}
