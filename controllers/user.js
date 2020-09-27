'use strict'
var bcrypt = require('bcrypt-nodejs'); // Necessari per criptar la password. 
var User = require('../models/user');
var mongoosePaginate = require('mongoose-pagination'); // modul de paginació d'usuaris. 
const { param } = require('../routes/user'); // ? crec que es el user index. 
var jwt = require('../services/jwt');
var fs = require('fs'); // Esta llibreria ens permet treballar en arxius
var path = require('path');
var Follow = require('../models/follow'); // Esta variable sera cridada a GetUser. Ho veurem comentat allà per a que. 
var Publication = require('../models/publication');
const { count } = require('console');
const user = require('../models/user');

// METODES DE PROVES I TESTING 
function home(req, res) {
    res.status(200).send({
        message: 'Hola mon, pagina inicial arrel.'
    });
}
function proves (req, res) {
    console.log (req.body);
    res.status(200).send({
        message: 'Ruta de proves.'
    });
}
// REGISTRE D'USUARI
function saveUser(req, res){
    var params = req.body; // Esta variable agafa tots els camps que li arriben per el POST 
    var user = new User(); // Esta variable permetra passar-li un usuari nou mitjançant un objecte.    
    // Generarem una condició on li passarem els parametros dels models d'usuari que li hem definit.
    // Si la condició es TRUE, s'aplica.
    if(params.nom && params.apellido && 
       params.nick && params.email && 
       params.password){                                                                                 // INCIDENCIES // 
        // Li passarem els valors d'usuari a parametres.      // Despues de tornarme loco durant mes de 12h, si aqui no es posen .toLowerCase pasa que cuan pases 
        user.nom = params.nom;                                // el nick en minuscula i el nick en la primera lletra en mayuscula, desde diferents correus, ho registra igual. 
        user.apellido = params.apellido;                      // Esta bona praxis evita esta gran tocada de collons que m'ha torturat la ment durant hores. 
        user.nick = params.nick.toLowerCase();                // ------------------------------------------------------------------------------------------------------------
        user.email = params.email.toLowerCase();              // Finalment el POSTMAN ha passat a la DB les condicions correctament sense estes males garrames que generava. 
        user.rol = 'ROLE_USER';                               // Pa cagarse i no torcarse. Aixo repasateu i guarda una plantilla que te servira en un futur. 
        user.image = null;
        // Evita que es pugui generar una duplicitat d'usuari. Busca si ja esta registrat algú igual. Aporta Control. 
        // Li pasarem un comparador lògic OR. Es un or perque li hem de dir que busque o l'email o el nickname. Aixo ho posarem
        // dins d'un Array. Tot el de l'array, s'evalua. 
        // Esta comprovació l'adjuntaré en imatge. Veurem que ens tirarà un error si tractem de reenviar la mateixa petició en lo formulari del POSTMAN.
        // Si salta l'error de que no pots enviar headers que ha s'han enviat al client, això es que rula C BON. 
                
    User.find({ $or: [                       
        {email: user.email.toLowerCase()},
        {nick: user.nick.toLowerCase()}
            // Aqui li passem un callback com hem fet igual baix. Te dos paramentros. Error i users. Si es error, retornara un missatge d'error
            // Si es un usuari, executarà la validació 
            ]}).exec((err, users) => {
                if(err) return res.status(500).send({message: 'Error en la peticion de usuarios'});                         
                if(users && users.length >= 1){ // si Usuaris o la longitud d'usuaris es menys o igual a 1 ( per ja haver-lo i verificarse com a tal)
                return res.status(200).send({message: 'El usuario o email que intenta registrar ya existe.'}); // enviara este missatge corroborant-ho. Te logica. 
                }else{
                //PASS. S'ha de xifrar. Hem d'incloure el modul instalat al principi de Bcrypt. El codi salta aqui si el user find no es compleix.
                bcrypt.hash(params.password, null, null, (err, hash) => { // li podem repetir varies vegades parametros a null per fortificar la password, pero en un es necessari.
                user.password = hash;
                // Ens ahorrem logica i caure en un bucle de if-else-if-else.
                user.save((err, userStored) => { // Si es produeix un error en mes de l'usuari guardat, li tirem una condicio que ens retorne un missatge d'error. 
                if(err) return res.status(500).send({message: 'Error al guardar el usuario'});
                if(userStored){ // Si en mes d'un error, es un usuari valid, envia l'estat de que es un usuari guardat en los datos. Ho podem veure al POSTMAN.
                res.status(200).send({user: userStored});
                }else{ // Si no, tira un error 404 on no s'ha guardat l'usuari. 
                    res.status(404).send({message: 'No se ha registrado el usuario'});
                }
            });
        });  
    }                // Ficar aixo evita que salte al bcrypt i que execute 
});                  // codi innecessari per a no res. Recorda-ho. Optimitza. 
                     // O sigue, el bcrypt abans estava fora d'aixo, baix 
                     // esta barra llarga.
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////       
       // Si no es verdadera la condició de dalt el find, incloent el crypt traspapelat a dalt, li passem un else per a que replenesem el necessari. . 
    }else{
        res.status(200).send({
        message: 'Porfavor, envia todos los campos necesarios.'
        });
    }
}       

// METODE DE LOGIN DELS USUARiS 

// Volem recollir els parametres que entren per POST. Necessitarem un requeriment i un res.
// Sabem que el input estarà a un body, que haura d'introduir un email i una contrasenya.  
function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;
    // Farem un Find per comprobar si el que m'entra per l'input de l'usuari, esta a la DataBase. 
    // li passarem també un callback per si es produeix un error. I un callback per si l'entrat es correcte de l'usuari. 
    User.findOne({email: email}, (err, user) => {
        if(err) return res.status(500).send({message:'Error en la petición'}); // Li introduirem un condicional en un missatge de petició d'error i el codi.
        if(user){                                                              // Si no li tirarem un comparador del bcrypt (metodo especial del modul) en que compara
            bcrypt.compare(password, user.password, (err, check) => {          // la password registrada a la DB i la que esta introduint l'usuari. Li passarem un callback en err i check.
                if(check){
                    if(params.gettoken){
                        // Genera i torna el token JWT
                        return res.status(200).send({
                            token: jwt.createToken(user)                      // Este token s'ha de generar i importar desde un servei. També li passem l'usuari.  
                        });                                                   // Necessari un decode i la clau per desxifrar lo churro que genera. 
                    }else{
                        // Retorna datos de usuari
                        user.password = undefined;                             // Permet no retornar el crypt de password al POSTMAN. Es queda a backend. 
                        return res.status(200).send({user});
                    }                  
                }else{
                    return res.status(404).send({message:'El usuario no se ha podido identificar'});
                    }
                });                                                                                       
            }else{
                return res.status(404).send({message:'El usuario no se ha podido identificar!'});
            }
        });
    } // Cuan acabem anirem a route user.js i li crearem un api.post per registrar-lo i exportarlo desde aquí. 

// METODES DE TREBALL EN USUARIS, EXTACCIÓ DE DATOS I LLISTATS D'AQUESTS
// Conseguir datos de un usuari.
function getUser(req, res){
    var userId = req.params.id; // Li recollim REQUERINT els datos de la url un identificador que es troba als parametros.
                                // Si fossin per post o put, seria per req.body.id;
    User.findById(userId, (err, user) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});  
        
                           // COMENTARI ESPAGUETTI, Precaució.// 
                           // Es comenta també. asincronament, com veurem //
                           
        // Ara vull que em torni el objecte d'usuari solicitat per la URL.
        // Aixo ho he modificat mes avant. Aqui vull comprovar si l'usuari em segueix
        // Farem una petició a entitat de follow per veure si el seguim i aquest
        // ens segueix. Vull que em retorni l'usuari. Servira per al boto
        // del front end. Requerirem carregar a esta pàgina el modul Follow a una
        // variable dalt de tot. 
        if(!user) return res.status(404).send({message: 'El usuario no existe.'}); 
        // Aqui (*1)(mes abaix) cridarem a la variable Follow del model/follow per buscar >UN< únic user. NOSALTRES. No l'altre.
        // el cridarem per req user.sub. Recordem que sub es un parametro definit al Schema de l'usuari 
        // el cual conté l'identificador d'aquest usuari per desplegar aquest esquema dintre del payload.
        // En lo Token, que va al crypt i tal tal tal. Patata. Per lo tant li estem dient que busque (findOne) o sigue "JO", no algú.
        // en base a "user", que accedeix mitjançant un "req" (peticio, requeriment) a user.sub, que esta a jwt.js.  ok ? ok. 
        // Llavors, cuan em trobe a mi, despres que comprove si segueixo a l'usuari que arriva per la url (followed), que conté un 
        // ID d'usuari, execute callback error o retorna follow i user.

        // (*1) ! ! ! 
        // Imaginar que esta funció esta aqui, veure el problema que ens planteja, seguir a la funció ASYNC seguenti veure com ho solucionem
        //------------------------------------------------------------------------------------------------------------------------------
          //  Follow.findOne({"user":req.user.sub, "followed":userId}).exec((err, follow) => {
            //    if(err) return res.status(500).send({message: 'Error al comprobar el seguimiento de usuario.'});
              //  return res.status(200).send({user, follow});
        // -----------------------------------------------------------------------------------------------------------------------------

        // Ara imaginem que volem fer justament el contrari. Veure si el meu seguidor, realment em segueix a mi. Com passa a Instagram.
        // Obviament desde el Postman, podriem comprovar-ho facilment, no obstant desde la app i a nivell d'usuari, de moment nomes podrem
        // veure si jo segueixo a aquesta persona. Llavors aquest return ha de ser modificat i canviat, ja que si afegeixo un altre
        // callback dintre d'aquests dos callbacks que ja portem de find's, jo no puc tindre un return al segon i que salte al tercer 
        // callback en execució, ja que JAVASCRIPT es Asyncron. Hi hauria un problema de fluxe d'execució i acabaria tallant al return. 
        // Node.js no esperara a passar a la seguent acció, ho executara tot. PHP al ser sincron i pas a pas, si que es podria fer aixi.
        // Pero aqui no. Per solucionar-ho i implantar aquesta funcionalitat per veure si este usuari el segueixo ( que ja ho hem fet ) i si
        // aquest em segueix a mi, usarem el ASYNC i el AWAIT.  
        
        // Aqui retornarem mes avant. NO LLEGIR ARA LINEALMENT. Saltar a ASYNC. 
        // (****1****)
        // Ara aqui crido la funció ASYNCRONA. Porta per crida un request a payload sub: user./id- i userId 
        // Seguit de la promesa mitjanánt THEN amb un callback amb valor. 
        followThisUser(req.user.sub, userId).then((value) => {
            user.password = undefined;
            // Si recordem este return es el copiat de la funció que hem comentat, pero en mes de passarli el follow per callback
            // li passem el value, que es el valor de la promesa que ens retorna la funció asyncrona convertida en sincrona amb 
            // l'await :D. 
            return res.status(200).send({user, value});
        });        
    });                                                                            
}
                        // ASINCRONITAT // 
// Continuant el comentari anterior, aqui crearem la funció Asincrona: 
// Permetrem que al ser asincrona, la poguessim cridar a un altra banda, a l'anterior o cualsevol que li permetem cridar aqui. 
async function followThisUser(identity_user_id, user_id){
      // Crearem una variable on copiarem el callback últim de l'anterior funció, en callbacks, i cridarem 
      // els identificadors que li hem posat a aquesta funció. Davant de Follow li posarem un "AWAIT" per a que 
      // aqui dintre i no a la funció en general, aixo es converteixe en una crida SINCRONA. Llavors, abans d'executar
      // aixo, ESPERARÀ > AWAITEJARA a que se li ESCUPINYE un resultat d'un altre puesto, de l'anterior funció al que es requereixqui que necessite
      // ser cridat. I quin resultat volem? el Follow. 
      // Per incompatibilitat de versions no veiem el Value al POSTMAN i hem afegit una promesa despres de les execucions
      // i un catch per agafar d'espres l'error. 
      var following = await Follow.findOne({"user":identity_user_id, "followed":user_id}).exec().then((follow) => {
          return follow;// Este resultat se guarda a la variable following.        
      }).catch((err) => {
        return handleError(err);// Retorna un error per consola. 
      });
      // Anem a fer la mateixa crida pero al revés. Per comprovar si este user, ens segueix a natros. 
      // com podem veure invertim els parametres de busqueda 
      var followed = await Follow.findOne({"user":user_id, "followed":identity_user_id}).exec().then((follow) => {
        return follow; 
      }).catch((err) => {
        return handleError(err);
      });
      // Ara tornarem un JSON en los resultats following i followed. Al usar ASYNC aixo ens torna una PROMESA (Promise).
      // En aixo fet i en la promesa a les mans, COMENTAREM el segon FIND de l'anterior funció per veure com funciona i tal, pero cridarem
      // a tot aixo que hem fet. Pêr seguir llegint el procediment en ordre, retorna dalt a // (***1***)
      return {
        following: following,
        followed: followed  
      }
}

// CONTADOR D'USUARIS I ESTADISTIQUES
// Crearem un metode a la API que mos tornara los contadors de follows i followeds. Podrem mapejar un contador de tot això
// en cada un dels perfils dels usuaris. També contindra el contador de publicacions. 
// Hem de treure varios valors en funcions asincrones. Recordem que van per exec().then((xxx) => {}); i catch per a err. 

// Part 2: Importarem el model de publicacions fora a les variables, perque volem generar un contador de publicacions per usuari. 
function getCounters (req, res) {
    var userId = req.user.sub;
    if(req.params.id) {
       userId = req.params.id;
    }
    getCountFollow(req.params.id).then((value) => {
        return res.status(200).send({valor: value});
    });
}
// ASYNCRONES DELS COUNTERS ( Seguidors, seguits, publicacions )

async function getCountFollow(user_id){
    
    var following = await Follow.count({"user":user_id}).exec().then(count => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });
    var followed = await Follow.count({"followed":user_id}).exec().then(count => {
        return count;
    }).catch((err) => {
        return handleError(err);
    });
    var publications = await Publication.count({"user":user_id}).exec().then(count => {

    }).catch((err) => {
        return handleError(err);
    });
    return {
        following: following,
        followed: followed,
        publications: publications
    }
}

// RETORNAR USUARIS DE MANERA PAGINADA
// Aqui necessitarem fer el mateix que hem fet a les funcions anteriors de manera asincrona per el llistat de seguiment dels
// usuaris.
function getUsers(req, res){             // Crearem una variable que agafa l'identificador de l'usuari registrat al middleware, que ja esta guardat.
    var identity_user_id = req.user.sub; // Esta dintre de "sub" perque al servei JWT la propietat del ID es sub:
    var page = 1;                        // Li passem una variable page a 1 per defecte. Si pasa per url, s'actualtiza i entra a l'if.
    if(req.params.page){                 // si arriba el req per un parametro de pàgina ( la paginacio que hem instalat com a modul)
        page = req.params.page;          // Actualitza el valor per defecte si arriba el requeriment i l'aplica al passe per la pàgina. 
    }

    var itemsPerPage = 5;                // Li posem per defecte cuans usuaris volem per pàgina. Provarem en 5.
                                         // Li introduirem una busqueda completa de tots els usuaris en base al seu 
                                         // ID. Ho paginarem a una pagina i li passarem un callback per als errors, els usuaris
                                         // i un contador per saber que hem arribat a 5 o el que li especifiquesem. 

    
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!users) return res.status(404).send({message: 'No hay usuarios disponibles en la plataforma.'});

        followUserIds(identity_user_id).then((value) => {

            return res.status(200).send({    
                users,
                users_following: value.following,
                users_follow_me: value.followed,
                total,                       
                pages: Math.ceil(total/itemsPerPage)
            });
        });
        // Anteriorment aqui teniem passat aquest return, no obstant serà mes optim passar un array, ja que ara nomes passem el total
        // de users i pagines. Volem un array de ID's de user als que seguim i un per a los que mos segueixen.
        // Serà interesant modifcar-ho per al Front End, per pintar un botó o pintar-ne un altre, per mostrar això. Aixi que comentaré
        // Este tros de codi i n'aplicarem un de diferent adaptat a aquestes caracteristiques.       
    });
}
// FUNCIó ASYNC FOLLOWUSERID
async function followUserIds(user_id){
    // usarem un select per treure els camps que ens no ens interessen. Ho fem passantli un "0". També desactivarem user, que som natros.
    var following = await Follow.find({"user":user_id}).select({'_id':0, '__v':0, 'user':0}).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });
        return follows_clean;
    });
    var followed = await Follow.find({"followed":user_id}).select({'_id':0, '__v':0, 'followed':0}).exec().then((follows) => {
        var follows_clean = [];
        follows.forEach((follow) => {
            follows_clean.push(follow.user);
        });
        return follows_clean;
    });
    return {
        following: following,
        followed: followed
    }
}
// ACTUALITZACIO D'USUARiS
function updateUser(req, res){
    var userId = req.params.id; // Agafa els parametros per url. 
    var update = req.body;      // Agafa els nous datos del body o document. 
    delete update.password;     // Borrarem la propietat password de l'objecte per seguretat.
    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario'});
    }
    // Li especificarem que cuan updatejessem l'email i el nick als lowercase executi un for Each per comparar si user i user id son diferents a userId. Ens tirara errors
    // de multiple cabecera que arreglarem en un a simple 
    User.find({ $or: [
        {email: update.email.toLowerCase()},
        {nick: update.nick.toLowerCase()}
    ]}).exec((err, user) => {
        console.log(users);
        var user_isset = false;
        users.forEach((user) => {
            if(user && user._id != userId) user_isset = true;
        });
        // Ens tirara un error de multiple heading per consola, ja que no podem enviar
        // multiples cabeceres al mateix temps. Per aixo el que farem sera generar
        // una variable on li especificarem que nomes envie una cabecera simple per tal
        // que no ens tire l'error aquest per consola. 
        if (user_isset) return res.status(404).send({message: 'Los datos ya estan en uso '}); 
        
        User.findByIdAndUpdate(userId, update, {new:true}, (err, userUpdated) => { // new true torna l'objecte actualitzat de la seguent funcio.
        if(err) return res.status(500).send({message: 'Error en la petición'});
        if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
        return res.status(200).send({user: userUpdated});
    });
    
    });
}

// IMATGES D'USUARIS
function uploadImage(req, res){
    var userId = req.params.id;   
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
        if(userId != req.user.sub){
            // Al metode remove Files en general, li hem d'aplicar un return sempre per parar el codi
            // I evitar consecucions de reenvio de headers al Postman. 
            return removeFilesOfUpload(res, file_path, 'No tienes permiso para actualizar los datos del usuario');
        }       
        // Comprovarem si la extensio es correcta.
        if(file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif'){
            // Actualitza el document d'usuari loguejat. Si no, esta extensio es valida i farem un borrat per a que no el guarde, ja que primer el middleware el guarda. ( !!! )
            User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
                if(err) return res.status(500).send({message: 'Error en la petición'});
                if(!userUpdated) return res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
                return res.status(200).send({user: userUpdated});
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
// RETORN D'IMATGE D'USUARI
// Només serà accessible per user identificat.
function getImageFiles(req, res){
    var image_file = req.params.imageFile; // image_file requerira els parametres del fitxer d'imatge
    var path_file = './uploads/users/'+image_file; // ... Que estaran aqui dintre.
    //comprovarem que el fitxer existeix.
    fs.exists(path_file, (exists) => { // Comprovarem que existeix
        if(exists){
            res.sendFile(path.resolve(path_file)); // Si existeix, envia el fitxer.
        }else{
            res.status(200).send({message: 'No existe la imagen.'}); // si no, eso. Exportem i afegim ruta. 
        }
    });
}
// E X P O R T S 
// Exportarem les anteriors funcions fora. 
// Necesitarem portar les rutes a la carpeta de rutes i tirar la api, sigui post, get, put... etc. 
module.exports = {
    home,
    proves,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFiles 
}