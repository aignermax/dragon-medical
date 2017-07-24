/**
 * user
 * @description     :: Server Logic for Managing Accounts
 */

import * as jwToken from "./jwToken";
import { Collection, InsertOneWriteOpResult, DeleteWriteOpResultObject } from "mongodb";
import { DatabaseManager } from "./DatabaseManager";
import { bcrypt } from "bcrypt";

export let collectionUser: string = "user";

export interface User {
    email: string;
    name: string;
    password: string;
}
function comparePassword(password1: string, password2: string, cb: any ) {
    bcrypt.compare(password1, this.password2, (err, match) => {
        if (err) {cb(err); }
        if (match) {
            cb(true);
        }

    });
}

export function login ( email: string, password: string): Promise<any | Error> {
    // search database User Email
    return DatabaseManager.getInstance().findEntries<User>(collectionUser, { email})
    .then((users: Array<User>) => {
        if (users.length < 1 ) {
            Promise.reject(new Error("Could not find User"));
        }
        if (users[0].password === password) {
            Promise.resolve<any|Error>({ token: (jwToken.issue ( password ) ) });
        } else {
            Promise.reject( new Error ( "password does not match with our records"));
        }
    })
    .catch((error: Error) => {
        Promise.reject( error);
    });
}

/** insert one user or multiple users at once. */
export function write (user: Array<User> | User ): Promise<number | Error> {
    return DatabaseManager.getInstance().writeEntries<User>(collectionUser, user);
}

export function deleteUser (user: User): Promise<DeleteWriteOpResultObject> {
    return DatabaseManager.getInstance().deleteOneOrMany<User> (collectionUser, user);
}

export function createUser ( email: string, name: string= "", password: string= "" ): User {
    return { email, name, password};
}

