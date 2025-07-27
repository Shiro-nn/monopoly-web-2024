import {
    BadRequestException,
    InternalServerErrorException,
    Body,
    Controller,
    Delete,
    Get,
    Headers, Patch,
    Query
} from "@nestjs/common";
import {DatabaseService} from "../../services/database/service";
import {SessionService} from "../../services/session";

@Controller("social")
export class UserController {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Patch("name")
    async changeName(
        @Body("name") name: any,
        @Headers("Authorization") header: any
    ) {
        if (typeof name != 'string') {
            throw new BadRequestException("Никнейм не имеет формат строки");
        }
        if (name.length == 0) {
            throw new BadRequestException("Никнейм не содержит данных");
        }

        const user = await this.sessionService.getUser(header);
        user.name = name;

        await this.databaseService.updateUser({ id: user.id }, { name: user.name });

        return {
            statusCode: 200
        };
    }

    @Delete("me")
    async deleteMe(@Headers("Authorization") header: any) {
        const user = await this.sessionService.getUser(header);
        const count = await this.databaseService.deleteUser(user.id);

        await this.databaseService.deleteNote({owner: user.id});
        await this.databaseService.deleteComment({owner: user.id});

        if (count == 0) {
            throw new InternalServerErrorException("Не удалось удалить аккаунт из базы данных");
        }

        return {
            statusCode: 200
        };
    }

    @Get("me")
    async getMe(@Headers("Authorization") header: any) {
        const user = await this.sessionService.getUser(header);
        return {
            statusCode: 200,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                rate: user.rate,
            }
        };
    }

    @Get("user")
    async getUser(
        @Query("id") idAny: any,
        @Headers("Authorization") header: any
    ) {
        let id = parseInt(idAny);

        if (isNaN(id)) {
            const user = await this.sessionService.getUser(header);
            id = user.id;
        }

        const user = await this.databaseService.getUser({id: id});

        return {
            id: user.id,
            rate: user.rate,
            name: user.name,
        }
    }
}