'use strict'
// Avui astem a tope. 
// variables de llibreria. 
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
// Variables d'ususari. 
var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');
const { param } = require('../routes/user');
const message = require('../models/message');

// TEST 
function testeo(req,res) {
    res.status(200).send({message: 'Hola hola myfrens, les saluda sa po pe ta desde el controlador de mensaGes'});
}

// GUARDAT DE MISSATGES 
function saveMessages(req,res){
    var params = req.body;                // Agafarem els parametros que arriben per post al body. 
                                          // Necessitem comprovar si existeix la propietat params.text, l'emisor i el receptor. Ho farem en un comparador i condicional
    if(!params.text || !params.receptor)  // if not exist cap de les dos pos tu retorna un missatge. Per variar una mica. xd slu2 grepgrep. 
        return res.status(200).send({message: ' Porfavor, envia los datos necesarios.'});
    // Crearem una variable anomenada missatge on contindrà un nou missatge a crear. 
    // Li especificarem que el missatge de l'emisor sera igual al request que es demanara per saber l'usuari al payload en los seus datos ( id, email, blabla.)
    // Igual amb el receptor. Li passarem el parametro de text, ja que s'inclourà aquest i també la data en la cual s'envia. ( Es ampliable en un futur
    // a gifts, imatges, audio, etc.)
    var message = new Message();
    message.emisor = req.user.sub;
    message.receptor = params.receptor;
    message.text = params.text;
    message.fecha = moment().unix();
    message.viewed = 'false';

    // Guardat del missatge amb un callback d'error i un guardat.

    message.save((err, messageStored) => {
    if(err) res.status(500).send({message: 'Error en la petición.'});
    if(!messageStored) res.status(404).send({message: 'Error al enviar el mensaje'});

    return res.status (200).send({message:messageStored});
    });
}
// MiSSATGES REBUTS
function getReceivedMessages(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;
    // Usarem un buscador de missatges en base al receptor, el cual serà identificat per el seu usuari. 
    Message.find({receptor: userId}).populate('emisor', 'nom apellido _id nick image', ).paginate(page, itemsPerPage, (err, messages, total) => {
                                                        // El que mostrara.
        if(err) res.status(500).send({message: 'Error en la petición.'});
        if(!messages) res.status(404).send({message: 'No hay mensajes que mostrar'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
function getEmmitMessages(req, res) {
    var userId = req.user.sub;
    var page = 1;
    if(req.params.page){
        page = req.params.page;
    }
    var itemsPerPage = 4;
    // Usarem un buscador de missatges en base al receptor, el cual serà identificat per el seu usuari. 
    Message.find({emisor: userId}).populate('emisor receptor', 'nom apellido _id nick image', ).paginate(page, itemsPerPage, (err, messages, total) => {
                                                        // El que mostrara.
        if(err) res.status(500).send({message: 'Error en la petición.'});
        if(!messages) res.status(404).send({message: 'No hay mensajes que mostrar'});
        return res.status(200).send({
            total: total,
            pages: Math.ceil(total/itemsPerPage),
            messages
        });
    });
}
// Contador per a missatges no llegits. 
function getUnviewedMessages(req, res) {
    var userId = req.user.sub;

    Message.count({receptor:userId, viewed:'false'}).exec((err, count) => {
        if(err) res.status(500).send({message: 'Error en la petición.'});
        return res.status(200).send({
            'unviewed': count
        });
    });
}

// MARCAR MISSATGES COM A LLEGITS 

function setViewedMessage(req, res){
    var userId = req.user.sub;

    Message.updateOne({receptor: userId, viewed:'false'}, {viewed:'true'}, {"multi":true}, (err, messagesUpdated) => {
        if(err) res.status(500).send({message: 'Error en la petición.'});
        return res.status(200).send({
            messages: messagesUpdated
        });
    });
}

// EXPORTS 
module.exports = {
    testeo,
    saveMessages,
    getReceivedMessages,
    getEmmitMessages,
    getUnviewedMessages,
    setViewedMessage
};