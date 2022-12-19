var Annonces = require('../service/AnnoncesService');
var Questions = require('../service/QuestionsService');
var Reponses = require('../service/ReponsesService');
const { authorizeUser, authorizeAgent } = require('../auth');

function checkPermission(authorizeFunction, context) {
  const { res, next } = context;
  authorizeFunction(context, res, next);
}

module.exports = {
  Query: {
    annonces: (root, args, context) =>
      Annonces.getAnnonces({
        isAgent: context.auth?.user.permission,
      }),
    annonce: (root, { id }, context) =>
      Annonces.getAnnonce(id, {
        isAgent: context.auth?.user.permission,
      }),
  },
  Mutation: {
    createAnnonce: async (root, { input }, context) => {
      checkPermission(authorizeAgent, context);
      const annonce = await Annonces.postAnnonces({ body: input });
      return annonce;
    },
    deleteAnnonce: async (root, { annonceId }, context) => {
      checkPermission(authorizeAgent, context);
      const annonce = await Annonces.deleteAnnonce(annonceId);
      return annonce;
    },
    updateAnnonce: async (root, { annonceId, input }, context) => {
      checkPermission(authorizeAgent, context);
      const annonce = await Annonces.putAnnonce(annonceId, { body: input });
      return annonce;
    },
    createQuestion: async (root, { annonceId, input }, context) => {
      checkPermission(authorizeUser, context);
      const annonce = await Questions.postQuestion(annonceId, {
        body: input,
        auth: context.auth,
      });
      return annonce;
    },
    createReponse: async (root, { annonceId, n, input }, context) => {
      checkPermission(authorizeAgent, context);
      const annonce = await Reponses.postReponse(annonceId, n, {
        body: input,
        auth: context.auth,
      });
      return annonce;
    },
  },
};