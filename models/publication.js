'use strict'
// Aixo esta explicat al codi de "usuaris"

var mongoose = require('mongoose');
const { ObjectID } = require('bson');
var Schema = mongoose.Schema;


// Crearem l'esquema.

var PublicacionsSchema = Schema({
    text: String,
    file: String, 
    fecha: String,
    // L'usuari d'aquí apuntarà al ID referent a usuaris.js. Segons el model lògic de la DB que hem fet en DIA.
    user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Publication', PublicacionsSchema);


















