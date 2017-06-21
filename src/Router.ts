import {IncomingMessage, ServerResponse} from "http";

import {getAll as getAllDoctor} from "./doctor";

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
        let postData: any;

        if (request.method !== "POST" || (pathname !== "/" && pathname !== "")) {
            response.writeHead(501, {"Content-Type": "text/plain"});
            response.end("not implemented yet");

        } else {
            response.setHeader("Content-Type", "application/json");

            try {
                postData = JSON.parse(data);
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
                    if (postData.class === "doctor") {
                        if (postData.method === "getAll") {
                            return getAllDoctor();
                        }
                    }

                    return Promise.reject(new Error("request not correctly defined"));
                })
                .then((data: any) => {
                    let result = {
                        success: true
                    };
                    result[postData.class] = data;

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
