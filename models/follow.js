'use strict'
// Recorda provar despues de canviar els noms i veure si funciona igual. 
// Declararem en variables la busqueda dels esquemes de l'usuari i ho exportarem

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User'},
    followed: { type: Schema.ObjectId, ref: 'User'}
});



module.exports = mongoose.model('Follow', FollowSchema);