'use strict'

// Carregarem el PATH (llibreria)

//var path = require('path');
//var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

// Carrega de models (users)

var User = require('../models/user');
var Follow = require('../models/follow');
const follow = require('../models/follow');

// Mètode de prova

function saveFollow (req, res){
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub; // Cridem a tot l'objecte (user) loguejat per el middleware i setejat al payload.
    follow.followed = params.followed; // Li passem els parametros de jo a seguidor.
    if(follow.user && follow.followed){
        Follow.find({'user': follow.user, 'followed': follow.followed}, (err, followStored) => {
            if(followStored.length > 0){
                return res.status(404).send({message: 'Error en la peticion, ya existe el followed'});
            } else {
                follow.save((err, followStored) => {
                    if(err) return res.status(500).send({message: 'Error al guardar el seguimiento'});
            
                    if(!followStored) return res.status(404).send({message: 'El seguimiento no se ha guardado'});
                    
                    return res.status(200).send({follow: followStored})
                });
            }
        });
    } else {
        return res.status(404).send({message: 'Error en la peticion, falta el usr o followed'});
    }
}


                                        // ERROR DE MULTIPLICITAT DE FOLLOWERS  !!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            // Solucionat a les linies de dalt. 
    //follow.save((err, followStored) => { // Guardarem el Follow i cridarem a Callback per a passar els missatges d'error i guardar si es dona la verificació o el cas.
        //if(err) return res.status(500).send({message: 'Error al guardar el seguimiento.'});
        //if(!followStored) return res.status(404).send({message: 'El seguimiento no se ha guardado.'});
        //return res.status(200).send({follow:followStored});
    

// DEIXAR DE SEGUIR USUARIS
function deleteFollow(req, res){
    var userId = req.user.sub; // L'usuuari en el que estem loguejats.
    var followId = req.params.id; // Es l'usuari al que volem deixar de seguir.
    // Busca els parametros ID i ID al que segueix.
    Follow.find({'user':userId, 'followed':followId}).remove(err => {
        if(err) return res.status(500).send({message: 'Error al dejar de seguir al usuario.'});
        return res.status(200).send({message:'El seguidor se ha eliminado.'});
    });
}
// LLISTAR USUARIS QUE SEGUIM
function getFollowingUsers(req, res){
    
    var userId = req.user.sub; // Igual que abans, recollirem l'ID del usuari registrat.
    if(req.params.id && req.params.page){       // Si arriba un request amb els parametres corresponents a la ID
        userId = req.params.id; // Es que és userId.
    }
    // Comprovarem si ens arriba la pagina.
    var page = 1;
    if(req.params.page){ // Si arriba una pagina per la url, aquesta tindra els parametros de req.
        // Actualitzarem els valors de la pagina.
        page = req.params.page; // Normalment sempre arriba l'user Id i despres la pagina.
    }else{
        page = req.params.id;
    }
    var itemsPerPage = 4; // Llistarem 4 usuaris per pagines de moment. Tot i que es ampliable.
    // Farem un FIND per buscar per tots els follows que jo estic seguint. Es a dir, busca el meu ID que estigui al camp follow dels usuaris seguits per detectarlos.
    // Popularem la informacio del camp followed. Aixo cambia l'id per el document corresponent a este object ID, per tindre un objecte complet en tota la info
    // del usuari al que estem seguint. Per aixo li indiquem el path 'followed', que es on correspon aquesta info
    // Paginarem i li passarem la pagina actual i els items per pagina (4).
    // També li passarem el callback d'error, els follows i el total complet per aquesta paginacio i tirar els missatges corresponents. 
    Follow.find({user:userId}).populate({path: 'followed'}).paginate(page, itemsPerPage, (err, follows, total) => {
        
        if(err) return res.status(500).send({message: 'Error en el servidor.'});
        // Si no arriba follows perque no n'hi han: 
        if(!follows) return res.status(404).send({message: 'No estas siguiendo a ningun usuario como para que lo elimines'});
        // Si tot va be li enviarem varies coses: 
        return res.status(200).send({
            total: total, // Total de documents que ens torna el FIND. 
            pages: Math.ceil(total/itemsPerPage), // Mitjana del total partit per items per pagina. 
            follows                               // Retorna el objecte Follows per crear la propietat com a objecte complet en tots els follows.
        });
    });
}
// LLIsTAR USUARiS QUE ENs SEGUEIXEN
function getFollowedUsers(req, res){
    var userId = req.user.sub;
    if(req.params.id && req.params.page){   
        userId = req.params.id; 
    } 
    var page = 1;
    if(req.params.page){      
        page = req.params.page;
    }else{
        page = req.params.id;
    }
    var itemsPerPage = 4; 
                 // Cambiem el user per followed. Es l'unica cambi, apart de popular user. 
    Follow.find({followed:userId}).populate('user').paginate(page, itemsPerPage, (err, follows, total) => {
        
        if(err) return res.status(500).send({message: 'Error en el servidor.'});
        if(!follows) return res.status(404).send({message: 'No te sigue ningun usuario.'});      
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage), 
            follows                              
        });
    });
}
// LLISTATS NO PAGINATS
// Retorna llistats d'usuaris. 
function getMyFollows(req,res){
    var userId = req.user.sub;
    var find =  Follow.find({user: userId});
    if(req.params.followed){
        find =  Follow.find({followed: userId});
    }
    find.populate('user followed').exec((err, follows) => {
        if(err) return res.status(500).send({message: 'Error en el servidor.'});
        if(!follows) return res.status(404).send({message: 'No sigues a ningun usuario.'});      
        return res.status(200).send({follows});
    });
}
module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows
}
