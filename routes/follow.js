'use strict'

// Fitxer de rutes del controlador dels Followes. 

// Carregarem els moduls necessaris. 

var express = require('express');
var FollowController = require('../controllers/follow'); // La ruta del controlador de folllowers
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

// Api de proves en auth. 

api.post('/follow', md_auth.ensureAuth, FollowController.saveFollow);
api.delete('/follow/:id', md_auth.ensureAuth, FollowController.deleteFollow);
api.get('/following/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowingUsers); // "?" Opcionalitat.
api.get('/followed/:id?/:page?', md_auth.ensureAuth, FollowController.getFollowedUsers);
api.get('/get-my-follows/:followed?', md_auth.ensureAuth, FollowController.getMyFollows);
module.exports = api;

