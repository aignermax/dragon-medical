import {IncomingMessage, ServerResponse} from "http";
import {Router} from "../../src/Router";
import {DragonServer} from "../../src/DragonServer";

DragonServer.getInstance()
    .start((request: IncomingMessage, response: ServerResponse, pathname: string, data: string) => {
        Router.getInstance().handle(request, response, pathname, data);
    })