import {Injectable} from "@nestjs/common";
import {createClient, RedisClientType, RedisDefaultModules, RedisFunctions, RedisModules, RedisScripts} from 'redis';
import config from "../config";

let client: RedisClientType<RedisDefaultModules & RedisModules, RedisFunctions, RedisScripts>;

@Injectable()
export class RedisService {
    constructor() {
        createClient({
            url: config.redis
        })
            .on('error', err => console.log('Redis Client Error', err))
            .once('connect', () => console.log('Подключен к Redis'))
            .connect()
            .then(cl => client = cl);
    }

    getClient() {
        return client;
    }
}