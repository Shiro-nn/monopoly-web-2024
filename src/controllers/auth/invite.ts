import {
    Body,
    Controller,
    Get,
    HttpCode,
    Post, Query,
} from '@nestjs/common';
import {InviteService} from "../../services/auth/invite";

@Controller("auth/invite")
export class InviteController {
    constructor(
        private readonly inviteService: InviteService,
    ) {
    }

    @Get("get")
    @HttpCode(200)
    async getInvite(@Query("id") id: string) {
        const inviter = await this.inviteService.getInviter(parseInt(id));
        return {
            statusCode: 200,
            inviterName: inviter.name,
            inviterId: inviter.id,
        }
    }

    @Post("find")
    @HttpCode(200)
    async findInviter(@Body("token") token: string, @Body("nickname") nickname: string) {
        const inviter = await this.inviteService.findInviter(token, nickname);
        return {
            statusCode: 200,
            inviterName: inviter.name,
            inviterId: inviter.id,
        }
    }

}
