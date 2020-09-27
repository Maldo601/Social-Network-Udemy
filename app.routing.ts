// ROUTING // 
// Importar Moduls i components necessaris per configurar el routing

import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// COMPONENTS > Imports del login i register de app.module.ts
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
// Variable no modificable a nivell de valor. Variable no variable. 

const appRoutes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent},
    {path: 'registro', component: RegisterComponent},
    {path: 'home', component: HomeComponent},
    {path: 'mis-datos', component: UserEditComponent}
];

// EXPORTS 
//
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);

// Per a que aixo funcione s'ha d'importar al app.module.ts