import {Collection, Db, MongoClient, InsertOneWriteOpResult , DeleteWriteOpResultObject,
     UpdateWriteOpResult} from "mongodb";

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

    isconnected(): boolean {
        if (!this.mongoClient) { return false; }
        return true;
    }

    connect(whoisCalling: string ): Promise<boolean|Error> {
        console.log("        [DatabaseMgr] -> Connect now: " + whoisCalling);
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
     * @param createIfNotFound - if == false, it only queries without generating a new collection.
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

    /**
     * alter the first one element that matches oldObject in the collection
     * @param collection -> here "doctor" (for now mostly)
     * @param newObject  -> new object { }
     * @param oldObject -> the object that will be overwritten
     */
    alterElement ( collection: Collection , newObject: any , oldObject: any): Promise<UpdateWriteOpResult> {
        return new Promise<UpdateWriteOpResult> ((resolve, reject) => {
            resolve(collection.replaceOne(
                oldObject,
                newObject
            ));
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }

    /** add new element to collection */
    insertElement(collection: Collection , newObject: any): Promise<InsertOneWriteOpResult> {
        return new Promise<InsertOneWriteOpResult> ((resolve, reject) => {
            resolve(collection.insert( newObject ));
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }

    insertElements(collection: Collection , newObject: Array<any>): Promise<InsertOneWriteOpResult> {
        return new Promise<InsertOneWriteOpResult> ((resolve, reject) => {
            resolve(collection.insert( newObject ));
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }

    deleteElement(collection: Collection , object: any): Promise<DeleteWriteOpResultObject> {
        return new Promise<DeleteWriteOpResultObject> ((resolve, reject) => {
            if (!object) {
                return reject( new Error("please specify which object you want to delete"));
            }
            resolve(collection.deleteOne(object));
        })
        .catch((error: Error) => {
            return Promise.reject(error);
        });
    }
}
