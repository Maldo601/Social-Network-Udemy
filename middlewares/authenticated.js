'use strict'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Crearem un middleware  que comprove el tokken que estem enviant en cada peticio.
// Cuan el client entra a la api, te que enviar un tokken. Aquest es un hash molt llarg codificat. 
// EL client l'envia i nosaltres hem de detectar si es correcte o no per deixarlo passar 
// al metode de la api o no. 

// Aquest middleware es un metode que s'executa abans del controlador mitjançant un proces lògic de verificació o no del tokken. 
// Si es correcte, aquest passa a l'api solicitada i si no ho denega l'accés, donant una resposta dient-nos que no es valida i que no estem autenticats
// Correctament. 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



var jwt = require('jwt-simple');
var moment = require('moment'); // Necessitem esta variable perque es el moment exacte actual en el cual l'user fa esta petició. 
var secret = 'Alumne1994';


// req: Datos que rebem de la petició
// res: Resposta a la petició
// next: Instrucció seguent, un jumper. Sense el next no surt del middleware.


exports.ensureAuth = function(req, res, next){
    if(!req.headers.authorization){                 // El Token te que arribar en un header. Si no (!req) arriba un header autoritzat, directament ERROR 403
        return res.status(403).send({message: 'Error, la petición no contiene la cabezera de autentificación. '});
    }
    var token = req.headers.authorization.replace(/['"]+/g, ''); // Si l'string te comilles simples o dobles les reemplaça per no res. El token esta llimpio d'esta manera i 
                                                                 // preparat per descodificar-lo i poder descodificar el payload.     
    try{                                                         // El payload es sensible a excepcions i errors. 
        var payload = jwt.decode(token, secret);                 // El posem a un trycatch per si tira un except, el capture i el poguem vore.   
        if(payload.exp <= moment().unix()){                      // Si al exportar el token el moment es mes petit que l'actual, aquest expira. Lògic, no podem triar mes gran 
                                                                 // i que el token vingue del futur xdddddddddd
            return res.status(401).send({
                message:'El Token ha expirado.'});
        }
    }catch(ex){
        return res.status(404).send({
            message:'El Token no es valido.'
        });
    }          
    req.user = payload;
    next(); // El Salto. 
}
                                                                // S'ha de carregar a RUTES. 
 

                                                                 

