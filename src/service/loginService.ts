import {Request, Response} from "express";
import {createUser, readUser} from "../controller/UserController";
import {UserInterface} from "../interface/UserInterface";

const bcrypt = require("bcrypt")
const saltRounds = 10;

/**
 * provides user sign-in
 * req.body must include { password, email}
 * msg : {
 *     401 - non_field_errors
 *     401 - unable_credential_errors
 *     200 - OK
 * }
 * @param {Request} req - eExpress Request
 * @param {Response} res - Express Response
 * @param {Function} next - Callback Function
 */
export async function userSignIn(req: Request, res: Response, next: Function) {
    const {email, password} = req.body;
    if (!(email && password)) {
        res.status(401).send({
            "msg": "non_field_errors"
        })
        return;
    }
    const user = await readUser(email);
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            res.status(200).send({
                "id": user.id,
                "email": user.email,
                "name": user.name
            })
        } else {
            res.status(401).send({
                "msg": "unable_credential_errors"
            })
        }
    })


}

/**
 * provides user sign-up
 * req.body must include { name, password, email}
 * msg : {
 *     401 - non_field_errors
 *     401 - duplicated_email_error
 *     200 - OK
 * }
 * @param {Request} req - Express Request
 * @param {Response} res - Express Response
 * @param {Function} next - Callback Function
 */
export async function userSignUp(req: Request, res: Response, next: Function) {

    if (!(req.body.name && req.body.password && req.body.email)) {
        res.status(401).send({
            "msg": "non_field_errors"
        });
        return;
    }
    if (await readUser(req.body.email)) {
        res.status(401).send({
            "msg": "duplicated_email_error"
        });
        return;
    }
    bcrypt.genSalt(saltRounds, function (err, salt) {
        const {password} = req.body;
        if (err) {
            console.log(err);
        }
        bcrypt.hash(password, salt, function (err, hashedPassword) {
            if (err) {
                console.log(err);
            }
            const user: UserInterface = {
                id: undefined,
                email: req.body.email,
                password: hashedPassword,
                name: req.body.name
            };
            console.log(hashedPassword)
            createUser(user);
        })
    })
    res.status(200).send({"msg":"OK"});

}

