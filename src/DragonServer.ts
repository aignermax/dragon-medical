import {createServer, IncomingMessage, ServerResponse, Server as httpServer} from "http";
import {parse} from "url";

export interface IDragonServerRequestHandler {
    (request: IncomingMessage, response: ServerResponse, pathname: string, postData: string): void;
}

export class DragonServer {
    private static _instance: DragonServer = new DragonServer();

    private serverInstance: httpServer;
    private requestHandler: IDragonServerRequestHandler;

    private constructor() {
        if (DragonServer._instance) {
            throw new Error("Error: instantiation failed: Use DragonServer.getInstance() instead of new.");
        }
        DragonServer._instance = this;

        this.serverInstance = null;
        this.requestHandler = null;
    }

    public static getInstance(): DragonServer {
        return DragonServer._instance;
    }

    start(requestHandler: IDragonServerRequestHandler): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.serverInstance) {
                reject(new Error("server instance already exists"));
                return;
            }

            if (!requestHandler) {
                reject(new Error("no request handler supplied"));
                return;
            }

            this.requestHandler = requestHandler;

            this.serverInstance = <httpServer>createServer((request: IncomingMessage, response: ServerResponse) => {
                this.onRequest(request, response);
            }).listen(
                8080,
                "127.0.0.1",
                10
            );
            this.serverInstance.on("listening", () => {
                console.info("Server running on: 127.0.0.1:8080");
                resolve();
            });
            this.serverInstance.on("error", (error: Error) => {
                reject(error);
                this.serverInstance = null;
                this.requestHandler = null;
            });
        });
    }

    private onRequest(request: IncomingMessage, response: ServerResponse) {
        let pathname: string = parse(request.url).pathname,
            collectedData: string = "";

        request.setEncoding("utf8");

        request.on("data", (dataChunk: string) => {
            collectedData += dataChunk;
        });

        request.on("end", () => {
            this.requestHandler(request, response, pathname, collectedData);
        });
    }

}
