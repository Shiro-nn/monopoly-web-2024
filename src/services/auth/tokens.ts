import {BadRequestException, ForbiddenException, Injectable} from '@nestjs/common';
import {EncryptService} from "./encrypt";
import * as crypto from "crypto";

@Injectable()
export class TokensService {
    constructor(
        private readonly encryptService: EncryptService,
    ) {
    }

    getPublicKey(): string {
        return this.encryptService.publicKey;
    }
    getPublicJwkKey(): JsonWebKey {
        return crypto.createPublicKey(this.encryptService.publicKey).export({format: 'jwk'});
    }

    decryptData(data: string): string {
        return this.encryptService.privateDecrypt(data)[1];
    }

    decryptBody(body: any): string {
        if (!body) {
            throw new BadRequestException("Неизвестный аргумент в теле запроса");
        }

        if (typeof body != "string") {
            throw new BadRequestException("Аргумент в теле не является строкой");
        }

        const decrypted = this.decryptData(body);

        if (decrypted == "") {
            throw new BadRequestException("Неверный токен шифрования");
        }

        return decrypted;
    }

    parseAndCheckData(data: string): { email: string, pwd: string, name: string } {
        let parsed: any;

        try {
            parsed = JSON.parse(data);
        } catch {
            throw new BadRequestException("Не удалось пропарсить данные в json формат");
        }

        // 5 mns = 1000 * 60 * 5 = 300000 ms
        if (typeof parsed.date != "number" || Date.now() - 300000 > parsed.date) {
            throw new ForbiddenException("Истек токен авторизации");
        }

        if (typeof parsed.email != "string" || parsed.email.length == 0) {
            throw new BadRequestException("Не передан логин");
        }

        if (typeof parsed.pwd != "string" || parsed.pwd.length == 0) {
            throw new BadRequestException("Не передан пароль");
        }

        if (typeof parsed.name != "string") {
            parsed.name = "";
        }

        return {
            email: parsed.email,
            pwd: parsed.pwd,
            name: parsed.name
        }
    }
}
