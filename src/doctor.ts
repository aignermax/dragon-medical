import {Collection} from "mongodb";

import {DatabaseManager} from "./DatabaseManager";

export function getAll(): Promise<Array<any>|Error> {
    return DatabaseManager.getInstance().getCollection("doctor")
        .then((collection: Collection) => {
            return collection.find().toArray();
        });
}
