import {Injectable} from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor() { }

    async sendRegisterCode(email: string, code: string) {
        console.log('Register code: ' + code + '; email: ' + email);
        // todo
    }
}