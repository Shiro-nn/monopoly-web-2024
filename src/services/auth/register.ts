import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import {RedisService} from "../redis";
import {UtilsService} from "../utils";
import {EmailService} from "../email";
import {AuthService} from "./auth";

@Injectable()
export class RegisterService {
    constructor(
        private readonly utilsService: UtilsService,
        private readonly emailService: EmailService,
        private readonly redisService: RedisService,
        private readonly authService: AuthService,
    ) {
    }

    async init(email: string): Promise<string> {
        if (await this.authService.existsUser({email: email})) {
            throw new BadRequestException("Пользователь с данной почтой уже существует");
        }

        const client = this.redisService.getClient();
        const token = this.utilsService.createMd5(email);

        let code = await client.hGet('register:' + token, 'code');

        if (!code) {
            code = this.utilsService.generateRandomSix().toString();
            await client.hSet('register:' + token, 'code', code);
            await client.hSet('register:' + token, 'email', email);
            await this.emailService.sendRegisterCode(email, code);
        }

        return token;
    }

    async finish(token: string) {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("email_not_verified", "Вы не подтвердили свою почту");
        }

        const email = await client.hGet('register:' + token, 'email');
        const nickname = await client.hGet('register:' + token, 'nickname');
        const pwd = await client.hGet('register:' + token, 'pwd');
        const questions = await client.hGet('register:' + token, 'questions');
        let inviter = parseInt(await client.hGet('register:' + token, 'inviter'));

        if (!email) {
            throw new BadRequestException("email_not_found", "Вы не указали свою почту");
        }
        if (!nickname) {
            throw new BadRequestException("nickname_not_found", "Вы не указали никнейм");
        }
        if (!pwd) {
            throw new BadRequestException("pwd_not_found", "Вы не указали пароль");
        }
        if (!questions) {
            throw new BadRequestException("questions_not_found", "Вы не указали вопросы восстановления");
        }
        if (isNaN(inviter)) {
            inviter = 0;
        }

        // todo: make transactions
        if (await this.authService.existsUser({email: email})) {
            throw new BadRequestException("email_already_exists", "Пользователь с данной почтой уже существует");
        }

        await this.authService.createUser({email, pwd, name: nickname, inviter});
    }

    async resendCode(token: string): Promise<void> {
        const client = this.redisService.getClient();
        let code = await client.hGet('register:' + token, 'code');
        let email = await client.hGet('register:' + token, 'email');

        if (!code) {
            throw new NotFoundException("Токен не найден");
        }
        if (!email) {
            throw new NotFoundException("Email не найден");
        }

        await this.emailService.sendRegisterCode(email, code);
    }

    async checkCode(token: string, code: string): Promise<void> {
        const client = this.redisService.getClient();
        let codeOriginal = await client.hGet('register:' + token, 'code');

        if (code != codeOriginal) {
            throw new BadRequestException("Неверный код")
        }

        await client.hSet('register:' + token, 'codeVerified', '1');
    }

    async getNickname(token: string): Promise<string> {
        const client = this.redisService.getClient();
        let nickname = await client.hGet('register:' + token, 'nickname');

        if (!nickname) {
            throw new NotFoundException("Никнейм не указан");
        }

        return nickname;
    }

    async setNickname(token: string, nickname: string): Promise<void> {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("Вы не подтвердили свою почту");
        }

        if (this.utilsService.containsInvalidCharacters(nickname) || nickname.length < 8) {
            throw new BadRequestException("Никнейм содержит запрещенные символы")
        }

        await client.hSet('register:' + token, 'nickname', nickname);
    }

    async checkPwd(token: string, pwd: string): Promise<object> {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("Вы не подтвердили свою почту");
        }

        if (pwd.length < 1) {
            throw new BadRequestException("Не удалось расшифровать пароль");
        }

        const entropy = this.utilsService.entropy(pwd);

        if (entropy < 40) {
            return {
                statusCode: 400,
                message: 'Энтропия пароля меньше допустимых 40 бит.',
                entropy: entropy,
            };
        }

        const hashedPwd = this.utilsService.createSha512(pwd);
        await client.hSet('register:' + token, 'pwd', hashedPwd);

        return {
            statusCode: 200,
            entropy: entropy,
        }
    }

    async setQuestions(token: string, questions: object): Promise<object> {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("Вы не подтвердили свою почту");
        }

        let postParsed: any = {};

        for (const key in questions) {
            const value = questions[key];

            if (typeof value != 'string') {
                continue;
            }

            postParsed[key] = value;
        }

        await client.hSet('register:' + token, 'questions', JSON.stringify(postParsed));

        return postParsed;
    }

    async setInviter(token: string, inviter: number): Promise<void> {
        const client = this.redisService.getClient();

        if (await client.hGet('register:' + token, 'codeVerified') != '1') {
            throw new UnauthorizedException("Вы не подтвердили свою почту");
        }

        await client.hSet('register:' + token, 'inviter', inviter);
    }
}