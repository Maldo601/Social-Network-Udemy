

export class Message{
    constructor(
        public _id: string,
        public viewed: string,
        public text: string,
        public emisor: string,
        public receptor: string
    ){}
}