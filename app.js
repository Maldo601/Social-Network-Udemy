// Aqui se carregara el servidor Web Express
// Aixi com rutes i el magre de la configuració d'això.

'use strict'

var express = require('express');
// Convertirem les peticions del body a estructura javascript en lo parsejador. 
var bodyParser = require('body-parser');
// Carregarem el Framework Express.
var app = express();
// CARREGA DE RUTES
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');
var publication_routes = require('./routes/publication');
var message_routes = require('./routes/message');
// MIDLEWARES ( Es un metode que s'executa antes d'arribar a un controlador )
app.use(bodyParser.urlencoded({extended:false}));
// Cuan reb objectes de petició de datos, això ho converteix a JSON.
app.use(bodyParser.json()); 

// CORS

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});

// RUTES
// Ens permet fer midlewares, o sigue s'executa antes d'arribar a l'acció del controlador. 
// tinc disponible una ruta en aixo, que esta a /api/home. 
app.use('/api', user_routes);
app.use('/api', follow_routes);
app.use('/api', publication_routes);
app.use('/api', message_routes);

// EXPORTADOR DE CONFIGURACIO
// exporta les configuracions que hem creat abans. 
// Podem importar-ho a tots els fitxers. 
module.exports = app;