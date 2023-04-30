import * as passport from 'passport';
import * as LocalStrategy from 'passport-local';
import * as bcrypt from 'bcrypt';
import {HTTPService} from '../../interfaces/http/HTTPService';
import {Application} from 'express';
import {Server} from 'http';

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

    serializeUserHandler(user: any, done) {
        return done(null, user.id);
    }

    async deserializeUserHandler(id, done) {
        try {
            return done(null, await this.userController.findById(id));
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
