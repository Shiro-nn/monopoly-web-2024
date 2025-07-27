import {
    BadRequestException,
    ForbiddenException,
    Body,
    Controller,
    Get,
    Headers,
    Post,
    Query
} from "@nestjs/common";
import {FriendsService} from "../../services/friends";
import {DatabaseService} from "../../services/database/service";
import {SessionService} from "../../services/session";

@Controller("social/comment")
export class CommentController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Get()
    async getComment(
        @Query("note") noteAny: any,
    ) {
        const noteId = parseInt(noteAny);

        if (isNaN(noteId)) {
            throw new BadRequestException("Не передан id записки");
        }

        const comments = await this.databaseService.getComments({note: noteId});

        return {
            statusCode: 200,
            data: comments
        }
    }

    @Post()
    async createComment(
        @Body("note") noteAny: any,
        @Body("text") text: any,
        @Headers("Authorization") header: any
    ) {
        const noteId = parseInt(noteAny);

        if (isNaN(noteId)) {
            throw new BadRequestException("Не передан id записки");
        }

        if (typeof text != "string") {
            throw new BadRequestException("Текст комментария не является строкой");
        }

        if (text.length < 3) {
            throw new BadRequestException("Текст комментария должен быть больше 3-х символов");
        }

        const user = await this.sessionService.getUser(header);
        const note = await this.databaseService.findNote({id: noteId});

        if (!await this.friendsService.isFriend(note.owner, user.id))
            throw new ForbiddenException("Вы не друзья");

        await this.databaseService.createComment({
            owner: user.id,
            note: note.id,
            time: new Date(Date.now()),
            text: text,
        });

        return {
            statusCode: 201
        };
    }
}