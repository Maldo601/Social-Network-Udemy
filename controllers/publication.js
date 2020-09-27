'use strict'

// Porta tots els metodes, vars i funcions. relacionats en les publicacions. 
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

// Variables de models
var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');
const { find } = require('../models/publication');


// TEST 
function provant(req,res){
    res.status(200).send({message: 'Probando el controlador de publicaciones'});
}

// SAVES DE PUBLICACIONs

function savePublication(req,res){
    var params = req.body;  // Agafarem els parametros que arriben per el body. També crearem els parámetros que aixo cridara.                            
        if(!params.text)    // Si no arriba el parametro text, farem un return que avise. 
            return res.status(200).send({message: 'Debes enviar un texto !'});  
            var publication = new Publication(); // Generarem la nova publicació que tindra un text que ve dels req del body i uns arxius.
            publication.text = params.text;
            publication.file = 'null';
            publication.user = req.user.sub;     // Cridem al payload en lo sub que porta l'id de user. 
            publication.fecha = moment().unix(); // Li passarem un modul de dates per a controlar la fecha de publicacions. Ho posem a temps real
                                                 // Recordem que este fecha i estos parametros estan definits a models/publications. 
            // Ara necessitarem que aquesta nova publicació amb el que necessita per mostrar ( text, data, usuari i arxiu, es guarde a la DB
            publication.save((err, publicationStored) => {
            if(err) return res.status(500).send({message: 'Error al guardar la publicación.'});
            if(!publicationStored) return res.status(404).send({message: 'La publicación no ha sido guardada'});
            return res.status(200).send({publication: publicationStored});
    });      
}
// MÈTODE DE RETORN DE PUBLICACIONS D'USUARIS QUE SEGUEIXO. 
// Recull l'userID mentre fa un find dels usuaris als que segueixo. Busca les publicacions d'aquests usuaris, retornantmeles i pintantles al json o llista.

function getPublications(req,res){
    var page = 1; // Crearem una paginació amb valor per defecte 1 com hem explicat a altres controladors.
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;
    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error al devolver el seguimiento'});
        var follows_clean = []; 
        // Crearem un Array en una variable. Recorrerem els follows en un foreach i per cada interacció en l'objecte 
        // crearem un objecte anomenat follow. Dintre este objecte tindre l'element que esta recorrent en aquest moment.
        // Farem un push a followclean per afegir el id del usuari al que estic seguint. No es un id com a tal pero es un objecte complet
        // per a després comprovar si aquest objecte existeix o no. 
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        console.log(follows_clean);
        // En l'Array funcionant i retornant, ara buscarem les publicacions dels usuaris que se nos retornen.
        // Usarem un find a Publication indicant que busquem un user que estigui dintre una coleccio de documents que estiguin dintre una 
        // variable. S'usa "$in" per fer aquest tipo de busqueda, dintre un Array. Es a dir si dintre l'array tinc un usuari que coincideix amb
        // un document d'usuari i la busqueda els localitza i compara i veu que son el mateix, ens els escupinyarà. 

    
        // A això li passarem també un .sort(). El sort serveix per a que ens ordene les publicacions. Podem emprar varios parametros per configurar-ho
        // pero ens interesa de mes nova a mes vella. Per aixo li passarem al created_at un "-" davant. Pero com ho he modificat al PublicationSchema per 
        // "fecha", li direm "-fecha". Això ho popularem en l'objecte de l'usuari, per a que ens retorne els datos complets de l'user que ha creat la publicació
        // així com un callback amb la pàgina i els elements per pagina. Juntament amb un callback en l'errorr i les publicacions que ens retorne. 
        // També un total d'element. 
        Publication.find({user: {"$in": follows_clean}}).sort('-fecha').populate('user').paginate(page, itemsPerPage, (err, publications, total) => {
            if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});
            if(!publications) return res.status(404).send({message: 'Error, no hay publicaciones.'});
            return res.status(200).send({
                total_items: total,
                pages: Math.ceil(total/itemsPerPage),
                page: page,
                publications
            });
        });
    });
}
// FUNCIO DE RETORN DE PUBLICACIONS PER IDENTIFICADOR 
function getPublication(req,res){
    // Recollirem un ID que arriba per url. Aques ID sera la publi. 
    // Ho declararem i li donarem el req, els parametros de la id. 
    var publicationId = req.params.id;
    // Si volem que ens retorne una publi, tenim que buscarla. Ho farem en un findById
    Publication.findById(publicationId, (err, publication) => {
        if(err) return res.status(500).send({message: 'Error al devolver publicaciones'});
        if(!publication) return res.status(404).send({message: 'Error, no existe la publicacion.'});
        return res.status(200).send({publication});
    });
}
// DELETEJAR UNA PUBLICACIÓ

function deletePublication(req, res) {
    var publicationId = req.params.id;
    // Farem un FindbyId per localitzar l'objecte a borrar. 
    // Es bastant interessant comprovar que la publicació a borrar és nostra. 
    // Per aixo usarem un find user amb els datos del payload i que el camp _id a la vegada correspongui a l'identificador de la publicació.
    

    Publication.find({user: req.user.sub, '_id': publicationId}).remove ((err, publicationRemoved) => {
        if(err) return res.status(500).send({message: 'Error al borrar la publicación.'});
        // if(!publicationRemoved) return res.status(404).send({message:' No se ha borrado la publicacion.'});
        return res.status(200).send({publication: publicationRemoved});
    });
}
// MUNTAR IMATGES A UNA PUBLICACIÓ
// Es similar al loader que hem creat pèr a les imatges de perfil. 
function uploadImage(){
        var publicationId = req.params.id;   
        if(req.files){   // Files es per enviar arxius i muntarlos.
            var file_path = req.files.image.path;
            console.log(file_path);
            var file_split = file_path.split('\\'); // Cuan carreguessem una imatge estes barres separen la posicio de l'array. Mes info a la foto de carrega d'imatges
            console.log(file_split);
            var file_name = file_split[2]; // A la consola ens tira uploads - users - nomimatge. En ordre de posició, es 0 1 2. Volem carregar la posicio 2 a la database. 
            console.log(file_name);
            var ext_split = file_name.split('\.'); // Aixo detecta el format de la imatge i talla la ruta per el punt. Com el punt es caracter especial uso la barra. 
            console.log(ext_split);
            var file_ext = ext_split[1]; // Agafa la posició de la extensió. Posició 0 es el punt i posicio 1 es el format. Es pot tirar per consola i veure-ho.
            console.log(file_ext);
             
            // Comprovarem si la extensio es correcta.
            if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
                // Verificarem que l'usuari es el loguejar a fi de poder carregar imatges o fer modificacions. 
                Publication.findOne({'user': req.user.sub, 'id_':publicationId}).exec((err, publication) => {
                    if(publication){
                console.log(publication); // Surt un array buit i permet actualitzar fotos d'altres. Usar FIND ONE !  !   ! 
                // Canviarem els parametros de user per publication adaptant-ho a aquest cas. 
                Publication.findByIdAndUpdate(publicationId, {file: file_name}, {new:true}, (err, publicationUpdated) => {
                    if(err) return res.status(500).send({message: 'Error en la petición'});
                    if(!publicationUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
                    return res.status(200).send({publication: publicationUpdated});
                });
            }else{
                return removeFilesOfUpload(res, file_path, 'No tienes permiso para actualizar esta publicación.');
            }
        });
    }else{
        return removeFilesOfUpload(res, file_path, 'Extensión no válida');
    }
}else{
    return res.status(200).send({message: 'No se han subido imagenes'}); // Per si no envio cap imatge, que em tire este error, que esperava un arxiu pero que no arriba.
    }
}

function removeFilesOfUpload(res, file_path, message){
    fs.unlink(file_path, (err) => {
        if(err) return res.status(200).send({message: message});
    });
}
function getImageFiles(req, res){
    var image_file = req.params.imageFile; // image_file requerira els parametres del fitxer d'imatge
    var path_file = './uploads/publications/'+image_file; // Cambiarem users per publications, ja que hem creat la carpeta dedicada a aquest guardat als uploads.
    //comprovarem que el fitxer existeix.
    fs.exists(path_file, (exists) => { // Comprovarem que existeix
        if(exists){
            res.sendFile(path.resolve(path_file)); // Si existeix, envia el fitxer.
        }else{
            res.status(200).send({message: 'No existe la imagen.'}); // si no, eso. Exportem i afegim ruta. 
        }
    });
}



// EXPORTS 
module.exports = {
    provant,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,
    uploadImage,
    getImageFiles
}
