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
function comparePassword(password1: string, secondPwHash: string ): Promise<void> {
    return new Promise ( (resolve, reject) => {
        bcrypt.compare(password1, secondPwHash, (err, match) => {
            if (err) {
                console.log( "rejected " , err);
                reject(err);
            }
            if (match) {
                console.log( "resolved " , match);
                resolve();
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
        return comparePassword(users[0].password, password )
        .then ( () => {
            let webtoken = jwToken.issue ( {id: email} );
            return Promise.resolve<any|Error>( { id: email  , token: webtoken  } );
        })
        .catch ( (error ) => {
            console.log("pw1:" , users[0].password , " pw2 " , password , " " , JSON.stringify(error));
            return Promise.reject( new Error ( "password does not match our records"));
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

