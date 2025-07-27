import {Injectable} from '@nestjs/common';
import * as crypto from "node:crypto";

@Injectable()
export class UtilsService {
    constructor() { }

    createMd5(str: string): string {
        return crypto.createHash('md5').update(str).digest('hex');
    }

    createSha512(str: string): string {
        return crypto.createHash('sha3-512').update(str).digest('hex');
    }

    generateRandomSix(): number {
        return Math.floor(100000 + Math.random() * 900000);
    }

    containsInvalidCharacters(str: string): boolean {
        const regex = /[^a-zA-Z0-9_\-<>\[\]#№!?]/;
        return regex.test(str);
    }

    entropy(str: string): number {
        const len = str.length;

        const frequencies = Array.from(str)
            .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {});

        const entropy: any = Object.values(frequencies)
            .reduce((sum:number, f:number) => sum - f/len * Math.log2(f/len), 0);

        return parseInt(entropy);
    }
}