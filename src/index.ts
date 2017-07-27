import {exit} from "process";
import {DragonServer} from "./DragonServer";
import {DatabaseManager} from "./DatabaseManager";
import {Router} from "./Router";
import * as  cluster from "cluster";
import * as  http from "http";
let numCPUs = require("os").cpus().length;


if (cluster.isMaster) {
    console.info(`=== Starting DragonServer Master: ${process.pid}===`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // create the workers
    DragonServer.getInstance()
        .start((request: http.IncomingMessage, response: http.ServerResponse, pathname: string, data: string) => {
            Router.getInstance().handle(request, response, pathname, data);
        })
        .then(() => {
            console.log(`=== Finished DragonServer ${process.pid} start ===`);
            return DatabaseManager.getInstance().connect("index");
        })
        .then(() => {
            console.log(`--- ${process.pid}: Connection to MongoDB established ---`);
        })
        .catch((error: Error) => {
            console.error(`An error occured during server: ${process.pid} start`, error);
            exit(1);
        });
}
