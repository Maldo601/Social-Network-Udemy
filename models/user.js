'use strict'
// Treballem en mongoose, per tant li declararem i cridarem. Aixi com l'use strict per les 
// funcions especials de JS.
var mongoose = require('mongoose');

// crearem una variable per fer l'esquema i l'esquema d'usuari. 

var Schema = mongoose.Schema;
// Li pasarem els parametros i camps del DIA.
var validateEmail = function(email) {                                   // Esta funcio d'una versio anterior i fixejat el warning permet 
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;           // definir com ha de ser l'entrada del mail 
    return re.test(email)
};

var UserSchema = Schema({
    nom: String,
    apellido: String,
    nick: String, 
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: '',
        validate: [validateEmail, ''],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '']
    },     
    password: String, 
    rol: String,
    image: String, 
});

// Ara necessitem exportar el model de mongoose. 
// Li hem d'indicar a model la identitat. Pluralitzem "User". A la Coleccio de datos se guarda 
// tot en minuscula i guardarà l'esquema que hem creat a la DB. Seguirem creant el resto de models seguint estos
// pasos, en pagines diferents de codi. 
module.exports = mongoose.model('User', UserSchema);