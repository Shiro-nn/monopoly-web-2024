import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Ip,
    Post, Query,
    UnauthorizedException
} from '@nestjs/common';
import {AuthService} from "../../services/auth/auth";
import {RegisterService} from "../../services/auth/register";
import {TokensService} from "../../services/auth/tokens";
import {SessionService} from "../../services/session";

@Controller("auth/register")
export class RegisterController {
    constructor(
        private readonly authService: AuthService,
        private readonly registerService: RegisterService,
        private readonly tokensService: TokensService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Post("init")
    @HttpCode(201)
    async init(@Body("email") email: any) {
        const token = await this.registerService.init(email);

        return {
            statusCode: 201,
            token: token
        }
    }

    @Post("resendCode")
    @HttpCode(200)
    async resendCode(@Body("token") token: string) {
        await this.registerService.resendCode(token);

        return {
            statusCode: 200,
        }
    }

    @Post("checkCode")
    @HttpCode(200)
    async checkCode(@Body("token") token: string, @Body("code") code: string) {
        await this.registerService.checkCode(token, code);

        return {
            statusCode: 200,
        }
    }

    @Post("getNickname")
    @HttpCode(200)
    async getNickname(@Body("token") token: string) {
        const nickname = await this.registerService.getNickname(token);

        return {
            statusCode: 200,
            nickname: nickname,
        }
    }

    @Post("setNickname")
    @HttpCode(200)
    async setNickname(@Body("token") token: string, @Body("nickname") nickname: any) {
        await this.registerService.setNickname(token, `${nickname}`);

        return {
            statusCode: 200,
        }
    }

    @Post("setPassword")
    @HttpCode(200)
    async setPassword(@Body("token") token: string, @Body("pwd") pwd: string) {
        const decryptedPwd = this.tokensService.decryptData(pwd);

        if (decryptedPwd.length < 1) {
            throw new BadRequestException("Не удалось расшифровать пароль");
        }

        return await this.registerService.checkPwd(token, pwd);
    }

    @Post("setQuestions")
    @HttpCode(200)
    async setQuestions(@Body("token") token: string, @Body("data") data: object) {
        const questions = await this.registerService.setQuestions(token, data);

        return {
            statusCode: 200,
            questions: questions,
        }
    }

    @Post("setInviter")
    @HttpCode(200)
    async setInviter(@Body("token") token: string, @Body("inviter") inviter: number) {
        await this.registerService.setInviter(token, inviter);

        return {
            statusCode: 200,
        }
    }

    @Post("finish")
    @HttpCode(200)
    async finish(@Body("token") token: string) {
        await this.registerService.finish(token);

        return {
            statusCode: 200,
        }
    }
}
