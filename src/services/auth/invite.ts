import {
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import {Invite} from "../database";
import {DatabaseService} from "../database/service";
import {AuthService} from "./auth";
import {RedisService} from "../redis";

@Injectable()
export class InviteService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly redisService: RedisService,
        private readonly authService: AuthService,
    ) {
    }

    async getInviter(id: number): Promise<{name: string, id: number}> {
        let invite: Invite;

        try {
            invite = await this.databaseService.getClient()
                .select("*")
                .from<Invite>("invites")
                .where({id: id})
                .first();
        } catch {
            throw new ForbiddenException("Неверно указаны данные");
        }

        if (!invite) {
            throw new NotFoundException("Приглашение не найдено");
        }

        const user = await this.authService.getUser({id: invite.owner});

        return {
            name: user.name,
            id: user.id,
        }
    }

    async findInviter(token: string, nickname: string) {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("Вы не подтвердили свою почту");
        }

        const user = await this.authService.getUser({name: nickname});

        return {
            name: user.name,
            id: user.id,
        }
    }
}