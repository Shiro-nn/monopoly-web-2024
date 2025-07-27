import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    Ip,
    Post,
    UnauthorizedException
} from '@nestjs/common';
import {AuthService} from "../../services/auth/auth";
import {TokensService} from "../../services/auth/tokens";
import {SessionService} from "../../services/session";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly tokensService: TokensService,
        private readonly sessionService: SessionService,
    ) {
    }

    @Get("publicKey")
    getPublicKey() {
        return this.tokensService.getPublicKey();
    }
    @Get("publicKey/jwk")
    getPublicJwkKey() {
        return this.tokensService.getPublicJwkKey();
    }

    @Post("checkSession")
    @HttpCode(200)
    async checkSession(@Headers("Authorization") header: any) {
        if (!await this.sessionService.checkAuth(header)) {
            throw new UnauthorizedException("Вы не авторизованы");
        }

        return {
            statusCode: 200,
        }
    }

    @Post("login")
    @HttpCode(200)
    async login(@Body("data") data: any, @Ip() ip: string) {
        const decrypted = this.tokensService.decryptBody(data);

        const object = this.tokensService.parseAndCheckData(decrypted);
        delete object.name;

        const user = await this.authService.getUser(object);
        const token = await this.sessionService.create(user, ip);

        return {
            statusCode: 200,
            token: token,
        };
    }
}
