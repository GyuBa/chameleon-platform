import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import {User} from '../../entities/User';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from '../../utils/HTTPLogUtils';
import {ResponseData} from '../../types/chameleon-platform.common';

export class AuthService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/sign-in', HTTPLogUtils.addBeginLogger(this.handleSignIn, '/auths/sign-in'));
        router.post('/sign-up', HTTPLogUtils.addBeginLogger(this.handleSignUp, '/auths/sign-up'));
        router.post('/modify-password', HTTPLogUtils.addBeginLogger(this.handleModifyPassword, '/auths/modify-password'));
        router.delete('/sign-out', HTTPLogUtils.addBeginLogger(this.handleSignOut, '/auths/sign-out'));
        app.use('/auths', router);
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
    async handleSignUp(req: Request, res: Response, next: Function) {
        if (!(req.body.username && req.body.password && req.body.email)) {
            return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        }

        if (await this.userController.findByEmail(req.body.email)) {
            return res.status(401).send({msg: 'duplicated_email_error'} as ResponseData);
        }
        const {email, username} = req.body;
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        const user: User = new User();
        user.email = email;
        user.username = username;
        user.password = password;
        await this.userController.save(user);
        res.status(200).send({msg: 'ok'} as ResponseData);
    }

    handleSignIn(req: Request, res: Response, next: Function) {
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


    async handleModifyPassword(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) {
            return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        }
        if (!(req.body.password)) {
            return res.status(401).send({msg: 'non_field_error'} as ResponseData);
        }
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        try {
            const user = req.user as User;
            user.password = password;
            await this.userController.save(user);
            return res.status(200).send({msg: 'ok'} as ResponseData);
        } catch (e) {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }


    async handleSignOut(req: Request, res: Response, next: Function) {
        let isSessionError = false;

        if (!req.isAuthenticated()) return res.status(401).send({msg: 'not_authenticated_error'} as ResponseData);
        await req.session.destroy(error => {
            if (error) {
                isSessionError = true;
                console.error(error);
            }
        });

        if (!isSessionError) {
            return res.clearCookie('connect.sid', {path: '/'}).status(200).send({msg: 'ok'} as ResponseData);
        } else {
            return res.status(501).send({msg: 'server_error'} as ResponseData);
        }
    }
}
