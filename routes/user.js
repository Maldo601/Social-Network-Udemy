'use strict'

// Carregarem el controlador d'usuari. 

var express = require('express');
var UserController = require('../controllers/user.js');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'}); // Carpeta de pujada de imatges d'arxius
// RUTES

api.get('/home', UserController.home);
api.get('/proves', md_auth.ensureAuth, UserController.proves); // Li passem aqui l'auth per a que si es correcte el middleware salte al controlador. 
api.post('/register', UserController.saveUser);
api.post('/login', UserController.loginUser);
api.get('/user/:id', md_auth.ensureAuth, UserController.getUser); // Li passem l'id de l'user en esta sintaxis, el md_auth per autentificar i el controlador.
api.get('/users/:page?', md_auth.ensureAuth, UserController.getUsers); // Li passem la paginació d'usuaris en esta sintax, el md_auth i el controlador en la funció. 
api.get('/counters/:id?', md_auth.ensureAuth, UserController.getCounters);
api.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
api.post('/upload-image-user/:id', md_auth.ensureAuth, md_upload, UserController.uploadImage); // Li passem un middleware per muntar les imatges.
api.get('/get-image-user/:imageFile', UserController.getImageFiles);


module.exports = api;

// NEcessitarem carregar aixo al app.js.