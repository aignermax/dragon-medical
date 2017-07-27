

import {Collection } from "mongodb";
import {DatabaseManager} from "../../src/DatabaseManager";
import { expect } from "chai";

describe("DatabaseManager" , () => {

    before( async () => {
        if (DatabaseManager.getInstance().isconnected() === false) {
            await DatabaseManager.getInstance().connect("DatabaseMGR");
        }
    });

    it("should return Instance of DatabaseMgr", async () => {
        expect(DatabaseManager.getInstance() , "Got no instance of Database").to.exist;
    });

    it("should read Collection", async () => {
        let result: Collection<any>|Error = await DatabaseManager.getInstance().getCollection("test" , true);
        if ((<Error> result).message) {
            console.log((<Error>result).message);
        } else {
            console.log("         found collection -> '" + (<Collection<any>>result).collectionName + "'" );
        }
        expect((<Error>result).stack).to.not.exist;
    });
});
