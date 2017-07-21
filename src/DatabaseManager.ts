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

    /**
     * returns Promise of collection of Data or creates newEntry if
     * collection has not yet existed.
     * @param name - name of collection
     */
    getCollection(name: string , createIfNotFound: boolean = true): Promise<Collection|Error> {
        return new Promise<Collection|Error>((resolve, reject) => {
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
            if (createIfNotFound) {
                return this.dragonDatabase.createCollection(name);
            } else {
                return Promise.reject( new Error("collection not found"));
            }
        });
    }

    alterElement(collection: Collection , newObject: any , oldObject: any): Promise<Collection|Error> {
        return new Promise<Collection|Error> ((resolve, reject) => {
            collection.replaceOne(
                oldObject,
                newObject
            );
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }

    insertElement(collection: Collection , newObject: any): Promise<Collection|Error> {
        return new Promise<Collection|Error> ((resolve, reject) => {
            collection.insert(
                newObject
            );
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }

    deleteElement(collection: Collection , object: any): Promise<Collection|Error> {
        return new Promise<Collection|Error> ((resolve, reject) => {
            if (!object) {
                return reject( new Error("please specify which object you want to delete")); 
            }
            collection.deleteOne(object);
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }
}
