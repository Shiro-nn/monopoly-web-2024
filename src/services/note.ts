import {BadRequestException, ForbiddenException, Injectable} from '@nestjs/common';
import {DatabaseService} from "./database/service";
import {SessionService} from "./session";

@Injectable()
export class NoteService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
    ) {
    }

    async createNote(header: any, title: any, desc: any) {
        if (typeof title != "string") {
            throw new BadRequestException("Не передан заголовок");
        }
        if (typeof desc != "string") {
            throw new BadRequestException("Не передано описание");
        }

        const user = await this.sessionService.getUser(header);
        user.rate += 0.1;

        await this.databaseService.createNote({
            owner: user.id,
            title: title,
            desc: desc,
            time: new Date(Date.now())
        });

        await this.databaseService.updateUser(
            {id: user.id},
            {rate: user.rate}
        );
    }

    async deleteNote(header: any, id: any) {
        const user = await this.sessionService.getUser(header);
        const note = await this.databaseService.findNote({id: `${id}`});

        if (note.owner != user.id) {
            throw new ForbiddenException("Записка не принадлежит вам");
        }

        await this.databaseService.deleteNote({id: note.id});
    }

    async updateNote(header: any, id: number, title: any, desc: any) {
        const user = await this.sessionService.getUser(header);
        const note = await this.databaseService.findNote({id: id});

        if (note.owner != user.id) {
            throw new ForbiddenException("Записка не принадлежит вам");
        }

        let toUpdate: any = {};

        if (typeof title == "string" && title.length != 0) {
            toUpdate.title = title;
        }
        if (typeof desc == "string" && desc.length != 0) {
            toUpdate.desc = desc;
        }

        if (Object.keys(toUpdate).length == 0) {
            throw new BadRequestException("Не указаны данные, которые надо обновить");
        }

        await this.databaseService.updateNote({id: note.id}, toUpdate);
    }
}
