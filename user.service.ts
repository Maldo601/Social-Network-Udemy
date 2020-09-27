// Començarem important els imports dels servicis. 

import { Injectable } from '@angular/core';                      // (*1)
import { HttpClient, HttpHeaders } from '@angular/common/http';  // Necessitarem el modul de client i les cabeceres com les que hem treballat en lo POSTMAN, ja que el servei el passem a web i no a entorn de proves. 
import { Observable } from 'rxjs/Observable';                    // Recull les respostes. 
import { User } from '../models/user';                           // Obvi necessitarem un modul d'usuari. 
import { GLOBAL } from './global';

@Injectable()                                                    // El decorator Injectable servira per exportar un servei d'usuari.
export class UserService {
    public url: string;                                          // Contindrà la ulr publicament. Es un format String. Aixo cridara a ./global on es la url. 
    public identity;
    public token;
    public stats;
    constructor(public _http: HttpClient) {                      // Li passarem al constructor la propietat http_client fent referencia al seu import pertinent.
        this.url = GLOBAL.url                                    // al cual li indicarem que aquesta URL que volem al servei http client, esta definida a GLOBAL. 
        //console.log
    }

    // Registra a la Data Base. Al registre li passem l'usuari i el token. Aixo contindrà un observador. 
    // Li passarem uns parametros que serà un objecte json amb un string de l'usuari. 
    // Tambe li passarem els headers. Es generaràn de nou i es setejaran segons el model appllcation/json, amb el seu corresponent contingut. 
    // Finalment retornara el metode _http post, ja que estem fent un envio de datos a la url mitjançant el registre. 
    // El que retorna el servei es un OBSERVABLe, i aquest te que se cridat a registre.component.ts a onSubmit mitjançan un SUBCALLBACK. 
    register(user: User): Observable<any> {                     
       let params = JSON.stringify(user);
       let headers = new HttpHeaders().set('Content-Type', 'application/json');
       return this._http.post(this.url+'register', params, {headers:headers});
    }
    // Crearem un metode de Sign In on li passarem un objecte tipo user, aixi com un observable. Repetirem similarment
    // l'anterior que hem fet al registre. Este token identificara a l'user, com hem vist al backend.
    //
    signup(user, gettoken = null): Observable<any>{
        if(gettoken != null){
            user.gettoken = gettoken;
        }
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type','application/json');
        return this._http.post(this.url+'login', params, {headers: headers});
    }
    // Una vegada acabat el Onsubmit i el Get Token, el que hem de fer és accedir a aquests datos, creant dos metodes de consulta al Local Storage, per treure
    // el identity i el Get Token de manera ràpida, usan el servei. 
    getIdentity(){
    // Per això necessitarem que identity stringificat es converteixi a un JSON  parsejat, agafant del storatge local, l'objecte d'identitat. Ara tenim un objecte JSON. 
    // Llavors la variable identity conté un objecte JSON que hem parsejat mitjançant la presa d'un string que és identity. Dit d'una altra forma. 
        let identity = JSON.parse(localStorage.getItem('identity')); // let es var. dont panic.
    // Amb això fet, procedirem a crear les condicions. Si identity es diferent a algo indefinit ( que algo indefinit ho haurem de declarar publicament),  

        if(identity != "undefined"){                                 // Si identitat es diferent a algo no definit, aquesta identitat serà la identitat. Obvi xd.  
            this.identity = identity;                                
        }else{                                                       
            this.identity = null;                                    // I si no es així es que identitat esta buida.        
        }
        return this.identity;                                        // ergo tornam aquesta identitat si es diferent a algo indefinit o sense res, com a identitat que és.
    }
    getToken(){                                     
        let token = localStorage.getItem('token');                   // Símilar a l'anterior, es el mateix mètode i procediment d'aquest. 
        if(token != 'undefined'){
            this.token = token;
        }else{
            this.token = null;
        }
        return this.token;                                           // Estos dos mètodes s'han de importar a app.component.ts. Recordem que això es un export i obviament,  
    }                                                                // va a alguna banda.

    getStats(){
        let stats = JSON.parse(localStorage.getItem('stats'));
        if(stats != "undefined"){
            this.stats = stats;
        }else{
            this.stats = null;
        }
        return this.stats;
    }

    // Aquest nou metode permet cridar als contadors de l'usuari, per veure a qui segueix i qui el 
    // segueix a ell. Li passarem un userId amb valor null i un observable.
    // Declararem que headers dintre d'aquest metode tindra uns nous headers on tindran el Content Type
    // La autorització, que vindra del churro del token i la aplicacio json.
    // Condicionalment si la identitat de l'usuari es nula, es passara l'observable i retornara
    // la cabecera http on contindra la url + els contadors + ID d'user. 
    // Si no, nomes agafara la url i els contadors, pero sense identificar l'usuari, per tant 
    // si no identifica l'usuari, no pot identificar els contadors, pero aquests poden ser visibles igual.
    // Sense contar a cap usuari. Crec. 
    getCounters(userId = null): Observable<any>{
        let headers = new HttpHeaders().set('Content-Type','application/json')                        
                                       .set('Authorization', this.getToken());
        if(userId != null){
            return this._http.get(this.url+'counters/'+userId, {headers: headers});                
        }else{
            return this._http.get(this.url+'counters', {headers: headers}); 
        }            
    }
    
    updateUser(user: User):Observable<any>{
        let params = JSON.stringify(user);
        let headers = new HttpHeaders().set('Content-Type','application/json')
                                       .set('Authorization', this.getToken());
        return this._http.put(this.url+'update-user/'+user._id, params, {headers: headers});
    }
}







                                                                    // S'ha d'importar tot el fitxer al register.ts, login.ts, follow.ts, etc
                                                                    // passant previament per import al app.component.ts.







// (*1) 
// Es un patró de diseny en el que una classe pot requerir instancies de una o mes classes
// En lloc de ser generades dins del propi constructor, les reb ja instanciades per un mecanisme extern. 
// Aixo significa que podem requerir serveis u objectes que alguna de les nostres classes necessita. 
// Poden ser o be components, directives o serveis, sense la necessitat d'instanciar nosaltres mateixos 
// aquestes dependencies. 
