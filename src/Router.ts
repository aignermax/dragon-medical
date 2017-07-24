import {IncomingMessage, ServerResponse} from "http";
import * as doctor from "./doctor";
import * as user from "./user";

export interface postData {
    class: string;
    method: string;
    queryDoctors: Array<doctor.Doctor>;
}

export let errorMessages = {
    notLoggedIn:        { code: 1, Message: "You have to log in to use this function "},
    unknownError:       { code: 2, Message: "Unknown Error occured "},
    notImplementedYet:  { code: 3, Message: "Function is not yet implemented "},
    missingQueryDoctor: { code: 4 , Message: "Please specify a queryDoctor for this request"}
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
                    if (myPostData.class === "doctor") {
                        switch (myPostData.method) {
                            case "getAll": {
                                return doctor.getAll();
                            }
                            case "get": {
                                if (!myPostData.queryDoctors) {
                                    return Promise.reject(JSON.stringify(errorMessages.missingQueryDoctor));
                                }
                                return doctor.getOne(myPostData.queryDoctors[0]);
                            }
                            case "write": {
                                // Todo -> Clean up here
                                return doctor.write(myPostData.queryDoctors)
                                .then((value: any) => {
                                    return Promise.resolve(value);
                                })
                                .catch((error: Error) => {
                                    return Promise.reject(error);
                                });
                            }
                            case "delete": {
                                if (!myPostData.queryDoctors) {
                                    return Promise.reject(new Error("queryDoctors must be specified -> delete All is not OK from API"));
                                }
                                // Todo -> Clean up here, too, if time
                                return doctor.deleteOneOrMany(myPostData.queryDoctors)
                                .then((value: any) => {
                                    return Promise.resolve(value);
                                })
                                .catch((error: Error) => {
                                    return Promise.reject(error);
                                });
                            }
                            case "login": {
                                return user.login(myPostData.email , myPostData.password);
                            }
                            case "logout": {
                                return Promise.resolve("Just throw away your token");
                            }
                        }
                    }
                    return Promise.reject(new Error("request not correctly defined"));
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
