// Importació de elements que necessita un component. 
// Necessitarem el modul component d'angular i OnInt. 
// Això ve del core d'Angular. 
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { UserService } from '../../services/user.service';
// User service s'usa com un proveidor dintre del component, ja que proveix de servei. Va dintre un Array. 
// També ha d'anar al constructor com a privat. 


// Ara definirem el component i li passarem propietats i metadatos.
// Al crear el Component s'activarà a l'import. Nosaltres li volem passar 
// un login, user i el routing ja que es el que necessitem. On Init serà al iniciar o requeriment
// per iniciar. Deduim el resto de coses que li passem per lògica directament. 
@Component({
    selector: 'register',
    templateUrl:'register.component.html',
    providers: [UserService]
})
// Aqui exportem la classe RegisterComponent, ja que estem fent i volem generar un formulari d'aquest tipo. 
// Si això casca a terminal i estem treballant en VSCode, haurem d'activar desde Settings les funcions especials 
// i etiquetes de TypeScript. En cas que tinguem un altre IDE, una simple busqueda a internet mos explica com fixejar-ho. 
// implementarem un OnInit, "on" "initialitzate", ja que es carregarà a l'inici. 
export class RegisterComponent implements OnInit{
    public title:string;                         // Necessitarem passar-li el titol de forma publica, que va en un string
    public user: User;                           // i Obviament el que tenim definit de User a user.ts.
    public status: string;                           
    constructor(      
                                                 // Dins d'este constructor li pasarem les propietats del routing de forma privada
        private _route: ActivatedRoute,          // Que logicament serà necessari Activar la ruta i el router. 
        private _router: Router,
        private _userService: UserService        // Carregarem aixo al on submit, ja que cuan se pulse el botó de registre posara en marxa el servei
    ){                                           // Fent us de la api, headers, el client i la DB de Mongo. 
        this.title = 'Registrate';               // Definirem la propietat User on li pasem les propietats buides de models. 
        this.user  = new User(                   // Ja que aqui es construeix tot lesquema declarat a "user.ts" 
        "",                                      // Li passem el titol amb el nom pertinent i un nou usuari, ja que requerim un nou usuari 
        "",                                      // si accedim per primera vegada i tenim que registrar-nos. 
        "",
        "",
        "",
        "",
        "ROLE_USER",                             // Tot i que el rol si que li podem passar d'aquesta forma. Perque? No C. 
        "");                                     // En aixo podem crear un formulari basat en aquest objecte. 
    }                                            // Después d'això podem anar al register.comp.ts i començar a incloure-ho tot dintre de divs.
    ngOnInit(){
        console.log('LoginCarregat');            // Si ens dirigim allà ara, ho veurem explicat al codi. 
    }
    // Aqui dintre ja ens haura tornat un Observable desde user.service.ts i el que necessitem es un subCallback on ens subscrivim a aquest mètode observable. 
    // El metode subscribe, conte una res i un err, pero es sintaxa diferent a com ho hem vist dins ara i usa funcions especials.  
    onSubmit(registerForm){
        this._userService.register(this.user).subscribe(
            response => {
                if(response.user && response.user._id){ // Depenent de si mos retorna una cosa o un altra, switcheja.  Response li arriba respone.user juntament amb la seva id
                    console.log(response.user);         // O sigue, si arriba una propietat user que te un objecte de propietat en _id la peticio s'ha realitzat be. 
                    this.status = 'success';
                }else{
                    this.status = 'error';
                    registerForm.reset();
                }
            },
            error => {
                console.log(<any>error);
            }
        );
    }  
}

// Tots estos component.ts s'han de carregar a "app.module.ts"