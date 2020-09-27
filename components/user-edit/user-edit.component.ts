import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';


@Component({
    selector: 'user-edit',
    templateUrl: './user-edit.component.html',
    providers: [UserService]
})

export class UserEditComponent implements OnInit {
    public title: string;
    public user: User;
    public identity;
    public token;
    public status: string;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService
    ){
        this.title = 'Actualización de datos personales';
        this.user = this._userService.getIdentity();
        this.identity = this.user;
        this.token = this._userService.getToken();
    }
    ngOnInit(){
        console.log('user-edit.component se ha cargado correctamente.');
        console.log('this.user');
    }
    // Pot donar error a angular ja que previament hem de passarli un
    // UpdateUser al user.service.ts i despres cridarlo a aquest onSubmit.
    // Don't panic si tira errors la web després de fer el formulari d'actualitzacio
    // de datos. 
    onSubmit(){
        console.log(this.user)
        this._userService.updateUser(this.user).subscribe(
            response => {
                if(!response.user){
                    this.status = 'error';
                }else{
                    this.status = 'success';
                    localStorage.setItem('identity', JSON.stringify(this.user))
                    this.identity = this.user;
                    
                }
            },
            error => {
                var errorMessage = <any>error;
                console.log(errorMessage);
                if(errorMessage != null){
                    this.status = 'error';
                }
            }
        );
    }
}











