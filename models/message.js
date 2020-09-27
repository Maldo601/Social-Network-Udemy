'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = Schema({
    text: String,
    fecha: String,
    viewed: String, // Vistos dels missatges. jej. 
    emisor: { type: Schema.ObjectId, ref:'User'},
    receptor: { type: Schema.ObjectId, ref:'User' }
});

module.exports = mongoose.model('Message', MessageSchema);