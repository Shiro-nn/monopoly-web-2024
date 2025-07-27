import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {User} from "../database";
import {DatabaseService} from "../database/service";

@Injectable()
export class AuthService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {
    }

    async existsUser(select: object): Promise<boolean> {
        let user: {id: number};

        try {
            user = await this.databaseService.getClient()
                .select("id")
                .from<User>("users")
                .where(select)
                .first();
        } catch {
            return false;
        }

        return !(!user);
    }

    async getUser(select: object): Promise<User> {
        let user: User;

        try {
            user = await this.databaseService.getClient()
                .select("*")
                .from<User>("users")
                .where(select)
                .first();
        } catch {
            throw new ForbiddenException("Неверно указаны данные");
        }

        if (!user) {
            throw new NotFoundException("Пользователь не найден");
        }

        return user;
    }

    async createUser(user: {
        email: string,
        pwd: string,
        name: string,
        inviter: number
    }): Promise<void> {
        try {
            await this.databaseService.getClient()
                .from<User>("users")
                .insert(user)
                .returning('*');
        } catch {
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    async updateUser(search: object, update: object): Promise<number> {
        try {
            return await this.databaseService.getClient()
                .from<User>("users")
                .where(search)
                .update(update);
        } catch (err) {
            console.log(err);
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    async deleteUser(id: number) {
        try {
            const count = await this.databaseService.getClient()
                .select("*").from<User>("users")
                .where({id: id})
                .delete();

            // todo
            //this.sessionService.deleteUser(id);

            return count;
        } catch {
            throw new NotFoundException("Пользователь не найден")
        }
    }
}