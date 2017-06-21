import {Collection, Db, MongoClient} from "mongodb";

export class DatabaseManager {
    private static _instance: DatabaseManager = new DatabaseManager();

    private mongoClient: MongoClient;
    private dragonDatabase: Db;

    private constructor() {
        if (DatabaseManager._instance) {
            throw new Error("Error: instantiation failed: Use DatabaseManager.getInstance() instead of new.");
        }
        DatabaseManager._instance = this;
    }

    public static getInstance(): DatabaseManager {
        return DatabaseManager._instance;
    }

    connect(): Promise<boolean|Error> {
        if (this.mongoClient) {
            return Promise.reject(new Error("mongo client instance already exists"));
        }

        this.mongoClient = new MongoClient();

        return this.mongoClient.connect("mongodb://localhost:27017/Dragon").then((db: Db) => {
            this.dragonDatabase = db;
            return true;
        });
    }

    getCollection(name: string): Promise<Collection|Error> {
        return new Promise((resolve, reject) => {
            if (!this.dragonDatabase) {
                reject(new Error("not connected"));
                return;
            }

            this.dragonDatabase.collection(name, (error: Error, collection: Collection) => {
                if (!collection) {
                    reject(error);
                } else {
                    resolve(collection);
                }
            });
        }).catch((error: Error) => {
            if (error.message === "not connected") {
                return Promise.reject(error);
            }

            // collection does not seam to exist --> try to create
            return this.dragonDatabase.createCollection(name);
        });
    }
}
