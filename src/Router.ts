import {IncomingMessage, ServerResponse} from "http";
import * as doctor from "./doctor";
import * as user from "./user";
import * as jwToken from "./jwToken";

export interface postData {
    class: string;
    method: string;
    queryDoctors: Array<doctor.Doctor>;
}

export let errorMessages = {
    notLoggedIn:         { code: 1, Message: "You have to log in to use this function "},
    unknownError:        { code: 2, Message: "Unknown Error occured "},
    notImplementedYet:   { code: 3, Message: "Function is not yet implemented "},
    missingQueryDoctor:  { code: 4 , Message: "Please specify a queryDoctor for this request"},
    notCorrectlyDefined: { code: 5 , Message: "Request not correctly defined"}
};

export class Router {
    private static _instance: Router = new Router();

    private constructor() {
        if (Router._instance) {
            throw new Error("Error: instantiation failed: Use Router.getInstance() instead of new.");
        }
        Router._instance = this;
    }

    public static getInstance(): Router {
        return Router._instance;
    }

    handle(request: IncomingMessage, response: ServerResponse, pathname: string, data: string): void {
        let myPostData: any;

        if (request.method !== "POST" || (pathname !== "/" && pathname !== "")) {
            response.writeHead(501, {"Content-Type": "application/json"});
            response.end(JSON.stringify(errorMessages.notImplementedYet));
        } else {
            response.setHeader("Content-Type", "application/json");
            try {
                myPostData = JSON.parse(data);
            } catch (e) {
                let error: Error = e,
                    resultError: any = {
                        error: error.message,
                        errspec: data
                    };

                response.statusCode = 400;
                response.end(JSON.stringify(resultError));
                return;
            }

            Promise.resolve()
                .then(() => {
                    // Check the JWToken that user gets at Login
                    if ( myPostData.method === "login" ) {
                        return Promise.resolve();
                    }

                    let token: string = "";
                    let unauthorized: string = "";
                    if (request.headers && request.headers.authorization) {
                        let parts: Array<string>;
                        if ((<Array<string>>request.headers.authorization).forEach) {
                            parts = <Array<string>>request.headers.authorization;
                        }else {
                            parts = (<string>request.headers.authorization).split( " " );
                        }
                        if ( parts.length === 2) {
                            let scheme: string = parts[0];
                            let credentials: string = parts[1];
                            if ( /^Bearer$/i.test(scheme)) {
                                token = credentials;
                            }
                        } else {
                            Promise.reject( new Error( "Format is 'Authorization: Bearer [token]'"));
                        }
                    }
                    return jwToken.verifyPromise( token );
                })
                .then(() => {
                    if (myPostData.class === "doctor") {
                        switch (myPostData.method) {
                            case "getAll": {
                                return doctor.getAll();
                            }
                            case "get": {
                                if (!myPostData.queryDoctors) {
                                    return Promise.reject(new Error( JSON.stringify(errorMessages.missingQueryDoctor)));
                                }
                                return doctor.getOne(myPostData.queryDoctors[0]);
                            }
                            case "write": {
                                if (!myPostData.queryDoctors) {
                                    return Promise.reject(new Error (JSON.stringify(errorMessages.missingQueryDoctor)));
                                }
                                return doctor.write(myPostData.queryDoctors);
                            }
                            case "delete": {
                                if (!myPostData.queryDoctors) {
                                    return Promise.reject(new Error( JSON.stringify(errorMessages.missingQueryDoctor)));
                                }
                                return doctor.deleteOneOrMany(myPostData.queryDoctors);
                            }
                            case "login": {
                                if (!myPostData.email || !myPostData.password ) {
                                    return Promise.reject( new Error("[Router/handle] login needs email and password to operate"));
                                }
                                return user.login(myPostData.email , myPostData.password);
                            }
                            case "logout": {
                                return Promise.resolve("Just throw away your token");
                            }
                        }
                    }
                    return Promise.reject(new Error(JSON.stringify(errorMessages.notCorrectlyDefined)));
                })
                .then((data: any) => {
                    let result = {
                        success: true
                    };
                    result[myPostData.class] = data;
                    response.statusCode = 200;
                    response.write(JSON.stringify(result));
                })
                .catch((error: Error) => {
                    let resultError: any = {
                        error: error.message,
                        errspec: data
                    };

                    response.statusCode = 500;
                    response.write(JSON.stringify(resultError));
                })
                .then(() => {
                    response.end();
                });
        }
    }

}
