import {ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import knex from "knex";
import config from "../../config";
import {User, Note, Comment, Friends} from "./index";
import {SessionService} from "../session";
import boot from "./boot";

const pg = knex({
    client: "pg",
    connection: config.postgres,
    searchPath: ['knex', 'public'],
});

boot(pg).catch(err => console.error(err));


@Injectable()
export class DatabaseService {
    constructor(
        private readonly sessionService: SessionService,
    ) {
    }

    getClient() {
        return pg;
    }

    //#region notes
    async findNote(select: object): Promise<Note> {
        let note: Note;

        try {
            note = await pg.select("*").from<Note>("notes")
                .where(select)
                .first();
        } catch {
            throw new NotFoundException("Записка не найдена")
        }

        if (!note) {
            throw new NotFoundException("Записка не найдена");
        }

        return note;
    }

    async findAllNotes(select: object): Promise<Note[]> {
        let note: Note[];

        try {
            note = await pg.select("*").from<Note>("notes")
                .where(select);
        } catch {
            throw new NotFoundException("Записка не найдена")
        }

        if (!note) {
            throw new NotFoundException("Записка не найдена");
        }

        return note;
    }

    async createNote(note: {
        owner: number;
        title: string;
        desc: string;
        time: Date;
    }): Promise<void> {
        try {
            await pg.from<Note>("notes")
                .insert(note)
                .returning('*');
        } catch (err) {
            console.error(err);
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    async deleteNote(select: object): Promise<number> {
        try {
            return await pg.select("*").from<Note>("notes")
                .where(select)
                .delete();
        } catch {
            throw new NotFoundException("Пост не найден")
        }
    }

    async updateNote(search: object, update: object): Promise<number> {
        try {
            return await pg.from<Note>("notes")
                .where(search)
                .update(update);
        } catch (err) {
            console.log(err);
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    //#endregion

    //#region social
    async getFriends(id: number): Promise<number[]> {
        let friends: Friends;

        try {
            friends = await pg.select("*").from<Friends>("friends")
                .where({owner: id})
                .first();
        } catch {
            // ignored
        }

        if (!friends) {
            let pre = await pg.from<Friends>("friends")
                .insert({owner: id})
                .returning('*');
            friends = pre[0];
        }

        return friends.list;
    }

    async updateFriends(id: number, update: number[]): Promise<number> {
        try {
            return await pg.from<Friends>("friends")
                .where({owner: id})
                .update({list: update});
        } catch (err) {
            console.log(err);
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    async getComments(select: object): Promise<Comment[]> {
        let comments: Comment[];

        try {
            comments = await pg.select("*").from<Comment>("comments")
                .where(select);
        } catch {
            throw new ForbiddenException("Неверно указаны данные");
        }

        if (!comments) {
            throw new NotFoundException("Комментарии не найден");
        }

        return comments;
    }

    async createComment(comment: {
        owner: number;
        note: number;
        time: Date;
        text: string;
    }): Promise<void> {
        try {
            await pg.from<Comment>("comments")
                .insert(comment)
                .returning('*');
        } catch (err) {
            console.error(err);
            throw new ForbiddenException("Произошла ошибка в базе данных");
        }
    }

    async deleteComment(select: object): Promise<number> {
        try {
            return await pg.select("*").from<Comment>("comments")
                .where(select)
                .delete();
        } catch {
            throw new NotFoundException("Комментарий не найден")
        }
    }

    //#endregion
}