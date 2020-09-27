                                        // N O T E S      I N I C I A L S 

// Com a dato, si al package.json li afegim l'script:                                          // Matar el proces en CMD: TASKKILL /F /IM node.exe
//              "start":"nodemon index.js",                                                 
// i clausurem la execució del programa i la re arranquem esta vegada, en un 
//                      npm start 
// veurem que el codi se tira per nodemon. Si modifiquem el text a mostrar, s'actualtiza
// a temps real dinamicament, reiniciant el servidor. Podem comprovar-ho a la terminal del
// VSCode. Es pot provar al console log.


                                        // V A R I A B L E S 

// Primer es farà la conexió a MongoDB
'use strict'
// Carregarem la llibreria de Moongose per connectar a MongoDB
var mongoose = require('mongoose');
// Aqui cridem les app de app.js.
var app = require('./app');
// Li carregarem lo port. 
var port = 3800;

                                        // C O N E X I O    A     D A T A B A S E 

// Farem la conexió mitjançant un mètode de promeses
// Li donarem la ruta i port de localhost aixi com el nom que li 
// hem posat a la database del Robo3T

// SETEO DE WARNINGS 
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

// Afegirem un segon parametro al metode connect per donarli una nova url al 
// Parsejador i una topologia unificada, si no, ens tira WARNING i no volem que mos tire WARNINGS 
// perque me fan mal a la vista vorels i me posen nervioset. 
mongoose.connect('mongodb://localhost:27017/curs_mean_social', { useNewUrlParser:true, useUnifiedTopology: true })
        .then(() => {
            console.log("La conexió s'ha realitzat be.")

            // Crearem el Servidor aqui. O mes ben dit, l'escolta. Li passarem el port i un console log per verificar tot per terminal.  
            app.listen(port, () => {
                console.log("Servidor corrent a http://localhost:3800 i a l'escolta");
            // Si entrem a navegador i posem esta url, hauria de sortir Cannot GET. 
            // Igualment per terminal. 
            })
        })
        .catch(err => console.log(err));



















