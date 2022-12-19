Projet étudiant - 18 octobre 2022

# Lab - API REST - GraphQL

## Auteurs

| Nom | Prénom | login | email |
|--|--|--|--|
| Boireau | Mathieu | bm180551 | mathieu.boireau@etu.univ-lehavre.fr |
| Coufourier | Guillaume | cg180730 | guillaume.coufourier@etu.univ-lehavre.fr |


Pour lancer le serveur :

	npm start

L'API peut être testée avec Swagger depuis `http://localhost:8080/docs` ou avec GraphiQL depuis `http://localhost:8080/graphql`.

## Authentification

Certaines requêtes ont besoin d'une authentification.

Après une requête GET vers `http://localhost:8080/login`, on doit s'identifier sur le service OAuth2.0 GitLab `https://www-apps.univ-lehavre.fr/forge`. Un jeton d'accès est retourné et doit être ajouté dans l'en-tête des requêtes :

	Authorization: Bearer accessToken
