import {Injectable, UnauthorizedException} from '@nestjs/common';
import {User} from "./database";
import * as crypto from "node:crypto";
import {RedisService} from "./redis";
import {UtilsService} from "./utils";

@Injectable()
export class SessionService {
    constructor(
        private readonly redisService: RedisService,
        private readonly utilsService: UtilsService,
    ) {
    }

    async create(user: User, ip: string): Promise<string> {
        const hashedIp = this.utilsService.createMd5(ip);
        const uid = crypto.randomBytes(199).toString("hex") + hashedIp;

        delete user.pwd;

        const client = this.redisService.getClient();
        await client.hSet('session', uid, JSON.stringify(user));

        return uid;
    }

    async checkAuth(token: string): Promise<boolean> {
        const client = this.redisService.getClient();
        return await client.hExists('session', token);
    }

    async getUser(token: string): Promise<User> {
        const client = this.redisService.getClient();
        const data = await client.hGet('session', token);

        if (!data) {
            throw new UnauthorizedException("Вы не авторизованы");
        }

        const json = JSON.parse(data);
        return Object.assign({}, json);
    }

    async updateUser(token: string, user: User) {
        const client = this.redisService.getClient();
        await client.hSet('session', token, JSON.stringify(user));
    }
}