'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publications'});


api.get('/provant-pub', md_auth.ensureAuth, PublicationController.provant);
api.post('/publication', md_auth.ensureAuth, PublicationController.savePublication);
api.get('/publications/:page?', md_auth.ensureAuth, PublicationController.getPublications);
api.get('/publication/:id', md_auth.ensureAuth, PublicationController.getPublication);
api.delete('/publication/:id', md_auth.ensureAuth, PublicationController.deletePublication);
// Li passarem un Array per carregarli tant el md_ensure, juntament en md_upload que hem declarat abans com a middleware amb el multipart per enviarlo a ruta.
api.post('/upload-image-pub/:id', [md_auth.ensureAuth, md_upload], PublicationController.uploadImage);
// Retorn d'imatge. 
api.get('/get-image-pub/:imageFile', PublicationController.getImageFiles);
module.exports = api;