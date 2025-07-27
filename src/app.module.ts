import {Module} from '@nestjs/common';
import {AuthController} from './controllers/auth';
import {NoteController} from "./controllers/note";
import {CommentController} from "./controllers/social/comment";
import {FriendController} from "./controllers/social/friend";
import {UserController} from "./controllers/social/user";
import {AuthService} from "./services/auth";
import {NoteService} from "./services/note";
import {FriendsService} from "./services/friends";
import {DatabaseService} from "./services/database";
import {EncryptService} from "./services/encrypt";
import {SessionService} from "./services/session";

@Module({
    imports: [],
    controllers: [
        AuthController,
        NoteController,

        CommentController,
        FriendController,
        UserController
    ],
    providers: [
        AuthService,
        NoteService,
        FriendsService,

        DatabaseService,
        EncryptService,
        SessionService
    ],
})
export class AppModule {
}
