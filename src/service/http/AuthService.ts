import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import {User} from '../../entities/User';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';

export class AuthService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/sign-in', this.passportSignIn);
        router.post('/sign-up', this.userSignUp);
        router.get('/info', this.userInfo);
        router.post('/modify-password', this.passwordModify);
        router.post('/sign-in-legacy', this.userSignIn);
        router.delete('/sign-out', this.signOut);
        // TODO: 삭제 요망
        app.use('/auth', router);
    }

    /**
     * provides user sign-in
     * req.body must include { password, email}
     * msg : {
     *     401 - non_field_errors
     *     401 - unable_credential_errors
     *     200 - OK
     * }
     * @param {Request} req - Express Request
     * @param {Response} res - Express Response
     * @param {Function} next - Callback Function
     */
    async userSignIn(req: Request, res: Response, next: Function) {
        const {email, password} = req.body;
        if (!(email && password)) {
            res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
            return;
        }
        const user = await this.userController.findUserByEmail(email);
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            res.status(200).send({
                'id': user.id,
                'email': user.email,
                'username': user.username
            });
        } else {
            res.status(401).send(RESPONSE_MESSAGE.UNABLE_CREDENTIAL);
        }
    }

    /**
     * provides user sign-up
     * req.body must include { username, password, email}
     * msg : {
     *     401 - non_field_errors
     *     401 - duplicated_email_error
     *     200 - OK
     * }
     * @param {Request} req - Express Request
     * @param {Response} res - Express Response
     * @param {Function} next - Callback Function
     */
    async userSignUp(req: Request, res: Response, next: Function) {
        if (!(req.body.username && req.body.password && req.body.email)) {
            res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
            return;
        }

        if (await this.userController.findUserByEmail(req.body.email)) {
            res.status(401).send(RESPONSE_MESSAGE.DUPLICATED_EMAIL);
            return;
        }
        const {email, username} = req.body;
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        const user: User = new User();
        user.email = email;
        user.username = username;
        user.password = password;
        await this.userController.save(user);
        res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async userInfo(req: Request, res: Response, next: Function) {
        if (req.isAuthenticated()) {
            console.log(req.user);
            res.status(200).send(req.user);
        } else {
            res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        }
    }

    passportSignIn(req: Request, res: Response, next: Function) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (info) {
                return res.status(401).send(info.reason.msg);
            }

            return req.login(user, error => {
                if (error) {
                    return next(error);
                }
                return res.status(200).send(user);
            });
        })(req, res, next);
    }


    async passwordModify(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) {
            return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        }
        if (!(req.body.password)) {
            return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        }
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        console.log(req.user);
        try {
            const user = new User();
            user.password = password;
            await this.userController.save(user);
            return res.status(200).send(RESPONSE_MESSAGE.OK);
        } catch (e) {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }


    async signOut(req: Request, res: Response, next: Function) {
        let isSessionError = false;

        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        await req.session.destroy(err => {
            if (err) {
                isSessionError = true;
            }
        });

        if (isSessionError) {
            return res.status(200).send(RESPONSE_MESSAGE.OK);
        } else {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }
}