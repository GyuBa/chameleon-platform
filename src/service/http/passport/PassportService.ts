import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';
import * as bcrypt from 'bcrypt';
import {HTTPService} from '../../interfaces/http/HTTPService';
import {Application} from 'express';
import {Server} from 'http';
import {User} from "../../../entities/User";

const userCache = new Map<number, User>();

export class PassportService extends HTTPService {
    init(app: Application, server: Server) {
        passport.serializeUser(this.serializeUserHandler);

        passport.deserializeUser(this.deserializeUserHandler);

        passport.use(new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
            },
            this.verifyHandler
        ));

        app.use(passport.initialize());
        app.use(passport.session());
    }

    serializeUserHandler(user: User, done) {
        return done(null, user.id);
    }

    async deserializeUserHandler(id: number, done) {
        try {
            let user = userCache.get(id);
            if (user) {
                setTimeout(async _ =>
                    userCache.set(id, await this.userController.findById(id))
                );
            } else {
                user = await this.userController.findById(id);
                userCache.set(id, user);
            }
            return done(null, new User());
        } catch (e) {
            // console.error(e);
            return done(e);
        }
    }

    async verifyHandler(email, password, done) {
        try {
            const user = await this.userController.findUserByEmail(email);
            if (!(email && password)) {
                return done(null, false, {reason: {msg: 'non_field_errors'}});
            }
            if (!user) {
                return done(null, false, {reason: {msg: 'unable_credential_errors'}});
            }
            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return done(null, false, {reason: {msg: 'unable_credential_errors'}}); // 비밀번호 틀렸을 때
            }
            return done(null, {
                id: user.id,
                email: user.email,
                username: user.username
            });
        } catch (e) {
            // console.error(e);
            return done(e);
        }
    }
}
