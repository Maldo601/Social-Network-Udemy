// Exportarem la classe usuari. El fet de crear el constructor, 
// ens ahorra 3 passos, que son 



export class User{
    constructor(
        public _id: string,
        public nom: string,
        public apellido: string,
        public nick: string,
        public email: string,
        public password: string,
        public rol: string,
        public image: string
    ){}
}