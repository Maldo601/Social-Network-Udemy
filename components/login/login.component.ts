
                                             // IMPORTS //

// Importació de elements que necessita un component. 
// Necessitarem el modul component d'angular i OnInt. 
// Això ve del core d'Angular. 
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';



                                             // COMPONENT //

// Ara definirem el component i li passarem propietats i metadatos.
// Al crear el Component s'activarà a l'import. Nosaltres li volem passar 
// un login, ja que es el que necessitem. On Init serà al iniciar o requeriment
// per iniciar. 
@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    providers: [UserService]
})

                                        // EXPORTS / CONSTRUCTOR // 

// El funcionament d'aquests constructors i implementacions, es pot trobar comentat a register.component.ts per a mes informació
// sobre l'enteniment del codi. 

export class LoginComponent implements OnInit{
    public title:string;                        
    public user: User;
    public status: string;                                      // Necessari per portar els estats en string a la consola 
    public identity;                                            // Porta un objecte de l'usuari identificat. 
    public token;                                               // Token enviat a cada una de les peticions.
    constructor(
        private _route: ActivatedRoute,                         // Necessitarem activar el router i la ruta. 
        private _router: Router,                                // Al ser rutes i servei, es necessari que es passe per privat. 
        private _userService: UserService                       // També el servei de usuari. 
    ){
        this.title = 'Identificate';
        this.user  = new User(                                  // Ja que aqui es construeix tot lesquema declarat a "user.ts" 
        "",                                                     // Li passem el titol amb el nom pertinent i un nou usuari, ja que requerim un nou usuari 
        "",                                                     // si accedim per primera vegada i tenim que registrar-nos. 
        "",
        "",
        "",
        "",
        "ROLE_USER",                                            // Tot i que el rol si que li podem passar d'aquesta forma. Perque? No C. 
        "");
    }
    ngOnInit(){                                                 // Loader al inicialitzar el log in
        console.log('LoginCarregat');
    }
    onSubmit(){                                                 
                                                                // Logueja al usuari i consegueix els datos.
                                                                // farem una crida al servei de l'usuari i al login d'aquest, tal com hem fet al register.comp.ts
        this._userService.signup(this.user).subscribe( 
            response => {
                this.identity = response.user;                  // Si la identitat es igual a un "response" del usuari, activem condicionals. 
                // console.log(this.identity);
                if(!this.identity || !this.identity._id){       // si aquestes identitats no corresponen o no son certes a elles propiament, retorna error. 
                    this.status = 'error';                      
                }else{                                          // Si la identitat conte el valor tornat per res amb l'user, l'estat es success, vàlid, tira avant. 
                    this.status = 'success';
                    // Redirect a home. 
                //  this._router.navigate(['/home']);           // Si es compleix sucess sen va al home     
                    // Persistencia de datos.                   // Estos datos tenen que persistir durant la sessió. Es fa mitjançant un "localStorage"
                    localStorage.setItem('identity',            // Amb set Item, guardem un objecte dins del estoratge local, astoratge de guardar coses. Pero objectes de JS no els pot guardar. Numeros i stays i JSON strings, si. 
                    JSON.stringify(this.identity));             // Li passem la identitat que es un objecte json stringificat, que si que ho admet.
                                                                // Al ara estar setejats, es guarden a la sessió, una vegada iniciada al "identificat" cuan es pulsa el botó.
                    // Agafar els counters.                     // Farem un Copy de tot aixo i ho empastrarem al getToken. El codi s'executa tot en peça, no step by step.
                    this.getToken();                            // Aixo ve de baix, per comprovar-ho ens identifiquem a la web i observem la network del Inspeccionar. 

                }                                               // Llavors tant agafara el submit com el get Token, al cual li passarem la propietatat true. 
                // console.log(response.user);                  
                this.status = 'success';
            },
            error => {
                var errorMessage = <any>error;                  // El Persist, tant de token com de identity, es pot revelar obrint un inspeccionar al navegador i accedint a la
                // console.log(errorMessage);                   // secció de "Application". Allí se'ns desglosa un Local Storage amb la identity, el churro del token i el resto
                if(errorMessage != null){                       // que li fessim persistir, com counters, followers, etc. 
                    this.status = 'error';
                }
            }
        );
    }
    // Agarrar el Token
    getToken(){                                                 // Serà cridat a on submit. 
    this._userService.signup(this.user, 'true').subscribe(      // Li passarem un true com a string ''. 
        response => {
            this.token = response.token;                        // Cambiarem els valors per token.           
            console.log(this.token);
            if(this.token.length <= 0){                         // Si la llargaria del token es menor o igual a 0, obviament tirarà un error. Serveix per indicarli      
                                          // que si no se li ha passat, retorne error. Obviament no pot introduir un valor per dalt de 0
            }else{                                              // Es codi executat per una màquina, no se pot equivocar i nomes agafar "x" numeros del churro del token.                         
                                        // I, en cas de no complirse l'anterior, SUCCESS. 
                // Persistencia de USER TOKKEN.                 // El tokken te que persistir durant la sessió, no pot esvairse. Rollo caché. D'igual forma que hem vist abans. 
                localStorage.setItem('token', this.token);      

                // Conseguir contadors
                this.getCounters();
            }
            // console.log(response.user);
            this.status = 'success';
        },
        error => {
            var errorMessage = <any>error;
            // console.log(errorMessage);
            if(errorMessage != null){
                this.status = 'error';
            }
        }
    );
}
    getCounters(){                                              // S'ha de cridar a Get Token
        this._userService.getCounters().subscribe(
            response => {
                localStorage.setItem('stats', JSON.stringify(response));
                this.status = 'success';
                this._router.navigate(['/home']);
                console.log(response);
            },
            error => {
                console.log(<any>error);
            }
        )
    }
}





// Patrocinat per l'Estudi del Control del Codi. Espaguetitzant desde 1994. Cuina tradicional de tipus script bold Italic. 