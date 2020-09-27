'use strict'
// Carregarem els moduls de JWT i MOMENT per generar els Tokens i dates. 
var jwt = require('jwt-simple'); 
var moment = require('moment');
var secret = 'Alumne1994';
exports.createToken = function(user){ // Crearem una funció on li passarem el parametro user i aqui li generarem una variable anomenada payload.
    var payload = {                   // Porta objectes de l'usuari per codificar dins del token.
        sub: user._id,
        nom: user.nom,
        apellido: user.apellido,
        nick: user.nick,
        email: user.email,
        rol: user.rol,
        image: user.image,
        iat: moment().unix(),                  // Moment actual en que es genera. 
        exp: moment().add(30, 'days').unix     // Marca de temps. Expira en 30 dies.   
    };

    return jwt.encode(payload, secret);
};
