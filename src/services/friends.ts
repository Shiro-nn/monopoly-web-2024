import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {DatabaseService} from "./database";

@Injectable()
export class FriendsService {
    constructor(
        private readonly databaseService: DatabaseService,
    ) {
    }

    async isFriend(source: number, target: number): Promise<boolean> {
        if (source == target) {
            return true;
        }

        const friends = await this.databaseService.getFriends(source);
        return friends.includes(target);
    }

    async getFriends(source: number): Promise<number[]> {
        return await this.databaseService.getFriends(source);
    }

    async addFriend(source: number, target: number): Promise<void> {
        if (source == target) {
            return;
        }

        const friends = await this.databaseService.getFriends(source);

        if (friends.includes(target)) {
            return;
        }

        friends.push(target);

        const count = await this.databaseService.updateFriends(source, friends);

        if (count == 0) {
            throw new InternalServerErrorException("Не удалось подружиться :(");
        }
    }

    async removeFriend(source: number, target: number): Promise<void> {
        if (source == target) {
            return;
        }

        const friends = await this.databaseService.getFriends(source);

        const index = friends.indexOf(target);

        if (index < 0) {
            return;
        }

        friends.splice(index, 1);

        const count = await this.databaseService.updateFriends(source, friends);

        if (count == 0) {
            throw new InternalServerErrorException("Не удалось удалить друга");
        }
    }
}
