import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Post,
    Query
} from "@nestjs/common";
import {FriendsService} from "../../services/friends";
import {SessionService} from "../../services/session";

@Controller("social/friend")
export class FriendController {
    constructor(
        private readonly friendsService: FriendsService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Get()
    async getFriends(
        @Query("id") idAny: any,
    ) {
        let owner: number = parseInt(idAny);

        return {
            statusCode: 201,
            data: await this.friendsService.getFriends(owner)
        };
    }

    @Post()
    async addFriend(
        @Body("id") idAny: any,
        @Headers("Authorization") header: any
    ) {
        const user = this.sessionService.getUser(header);
        let id: number = parseInt(idAny);

        await this.friendsService.addFriend(user.id, id);

        return {
            statusCode: 201
        };
    }

    @Delete()
    async deleteFriend(
        @Body("id") idAny: any,
        @Headers("Authorization") header: any
    ) {
        const user = this.sessionService.getUser(header);
        let id: number = parseInt(idAny);

        await this.friendsService.removeFriend(user.id, id);

        return {
            statusCode: 200
        };
    }
}