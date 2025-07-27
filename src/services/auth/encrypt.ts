import {Injectable} from '@nestjs/common';
import * as crypto from "node:crypto";
import {DecryptAnswer} from "./DecryptAnswer";

@Injectable()
export class EncryptService {
    publicKey: string;
    privateKey: string;
    privatePwd: string;

    constructor() {
        const pwd = crypto.randomBytes(99).toString("hex");

        const keyPair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: "pkcs1",
                format: "pem"
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
                cipher: "aes-256-cbc",
                passphrase: pwd
            }
        });

        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;
        this.privatePwd = pwd;
    }

    privateDecrypt(encrypted: string): [DecryptAnswer, string] {
        try {
            const decrypted = crypto.privateDecrypt({
                key: this.privateKey,
                passphrase: this.privatePwd,
                oaepHash: "SHA512",
                padding: 4
            }, Buffer.from(encrypted, "base64"));

            return [DecryptAnswer.Success, decrypted.toString("utf8")];
        } catch {
            return [DecryptAnswer.InvalidToken, ""];
        }
    }
}
