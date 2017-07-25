/**
 * user
 * @description     :: Server Logic for Managing Accounts
 */

import * as jwToken from "./jwToken";
import { Collection, InsertOneWriteOpResult, DeleteWriteOpResultObject } from "mongodb";
import { DatabaseManager } from "./DatabaseManager";
import * as  bcrypt from "bcrypt";

export let collectionUser: string = "user";

export interface User {
    email: string;
    name: string;
    password: string;
}
/** compares the database-Hash with the Client-Sent plaintext-Password.
 * Note: It cannot compare Hash to Hash, as the hashes vary according to
 * the given salt.
 */
function comparePassword(plaintextpassword: string, hash: string ): Promise<void> {
    return new Promise ((resolve, reject) => {
        bcrypt.compare(plaintextpassword, hash , (err: Error, match: boolean) => {
            if (err) {
                reject(err);
            }
            if (match) {
                resolve();
            }else {
                reject();
            }
        });
    });
}

export function login ( email: string, password: string): Promise<any | Error> {
    if (!email) {
        Promise.reject("[user/login] need Email to operate");
    }
    email = email.toLowerCase();
    // search database User Email
    return DatabaseManager.getInstance().findEntries<User>(collectionUser, { email})
    .then((users: Array<User>) => {
        if (users.length < 1 ) {
            return Promise.reject(new Error("Could not find User"));
        }
        return comparePassword(password, users[0].password)
        .then ( () => {
            let webtoken = jwToken.issue ( {id: email} );
            return Promise.resolve<any|Error>( { id: email  , token: webtoken  } );
        })
        .catch ( (error ) => {
            return Promise.reject( new Error ( "password does not match our records " + password ));
        });
    })
    .catch((error: Error) => {
        return Promise.reject( error);
    });
}

/** Helper -> Make email lowercase for user and Array<user> */
export function makeUserEmailLowerCase( user: Array<User>|User) {
    if ((<Array<User>>user).map) { // make LowerCase
        (<Array<User>>user).map( (user) => {
            user.email = user.email.toLowerCase();
            return user;
        });
    } else {
        (<User>user).email = (<User>user).email.toLowerCase();
    }
}
/** encrypts the user.password directly (in-place) */
export function encryptUserPassword ( user: Array<User> | User) {
    if ((<Array<User>>user).map) { // make LowerCase
        (<Array<User>>user).map( async (user) => {
            user.password = bcrypt.hashSync(user.password, 3);
            return user;
        });
    } else {
        (<User>user).password = bcrypt.hashSync((<User>user).password , 3);
    }
}
/** insert one user or multiple users at once. */
export function write (user: Array<User> | User ): Promise<number | Error> {
    makeUserEmailLowerCase(user);
    encryptUserPassword(user);
    return DatabaseManager.getInstance().writeEntries<User>(collectionUser, user);
}

export function deleteUser (user: User): Promise<DeleteWriteOpResultObject> {
    makeUserEmailLowerCase(user);
    return DatabaseManager.getInstance().deleteOneOrMany<User> (collectionUser, user);
}

export function createUserObject ( email: string, name: string= "", password: string= "" ): User {
    email = email.toLowerCase();
    return { email, name, password};
}

