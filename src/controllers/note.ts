import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Headers,
    Patch,
    Post,
    Query
} from "@nestjs/common";
import {DatabaseService} from "../services/database/service";
import {SessionService} from "../services/session";
import {NoteService} from "../services/note";
import {FriendsService} from "../services/friends";
import {Note} from "../services/database";

@Controller("note")
export class NoteController {
    constructor(
        private readonly noteService: NoteService,
        private readonly friendsService: FriendsService,
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Get("/find")
    async getAllNotes(
        @Query("owner") ownerAny: any,
        @Headers("Authorization") header: any
    ) {
        const user = await this.sessionService.getUser(header);
        let owner: number = parseInt(ownerAny);

        if (isNaN(owner)) {
            owner = user.id;
        } else if (!await this.friendsService.isFriend(owner, user.id)) {
            throw new ForbiddenException("Вас (ID: " + owner + ") нет в списке друзей пользователя: " + user.name);
        }

        const notes = await this.databaseService.findAllNotes({owner: owner});

        return {
            statusCode: 200,
            data: notes,
        };
    }

    @Get()
    async getNote(@Query("id") id: any): Promise<Note> {
        return await this.databaseService.findNote({id: `${id}`});
    }

    @Post()
    async createNote(
        @Body("title") title: any,
        @Body("desc") desc: any,
        @Headers("Authorization") header: any
    ) {
        await this.noteService.createNote(header, title, desc);

        return {
            statusCode: 201
        };
    }

    @Delete()
    async deleteNote(
        @Query("id") id: any,
        @Headers("Authorization") header: any
    ) {
        await this.noteService.deleteNote(header, id);

        return {
            statusCode: 200
        };
    }

    @Patch()
    async updateNote(
        @Body("id") idAny: any,
        @Body("title") title: any,
        @Body("desc") desc: any,
        @Headers("Authorization") header: any
    ) {
        const id: number = parseInt(idAny);

        if (isNaN(id)) {
            throw new BadRequestException("ID записки передан некорректно");
        }

        await this.noteService.updateNote(header, id, title, desc);

        return {
            statusCode: 200
        };
    }
}