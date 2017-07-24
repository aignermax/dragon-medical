import {Collection, Db, MongoClient, InsertOneWriteOpResult , DeleteWriteOpResultObject,
     UpdateWriteOpResult, InsertWriteOpResult} from "mongodb";

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

    findEntries<T> (collection: string , queryObject: object = null): Promise<Array<T>|Error> {
        return DatabaseManager.getInstance().getCollection(collection)
            .then((collection: Collection) => {
                return collection.find(queryObject).toArray();
            });
    }

    /** insert one object (doctor, User etc) or multiple objects at once. */
    writeEntries<T> (collection: string, writeObject: Array<T> | T ): Promise<number | Error> {
        return new Promise<number| Error> ((resolve, reject) => {
            DatabaseManager.getInstance().getCollection(collection)
            .then((collection: Collection<any>) => {
                // insert Array
                if ((<Array<T>>writeObject).map) {
                    collection.insertMany( <Array<T>> writeObject )
                    .then ((result: InsertWriteOpResult) => {
                        if (result.result.ok) {
                            resolve(result.insertedCount);
                        } else {
                            reject(new Error("Error, Result of insertMany is: " + JSON.stringify(result)));
                        }
                    });
                } else {
                    // Insert One Element
                    collection.insert( writeObject )
                    .then((result: InsertOneWriteOpResult) => {
                        if (result.result.ok) {
                            resolve(result.insertedCount);
                        } else {
                            reject(new Error("Error, Result of insert is: " + JSON.stringify(result)));
                        }
                    });
                }
            });
        })
        .catch( (error: Error) => {
            console.log("[DatabaseManager/write] error: " + error.message + " " + error.stack );
            return Promise.reject(error);
        });
    }

    /** be careful -> if element is empty array, it deletes all documents
     * If doctor is an array, it deletes all elements in Database that have the same LANR as the array-Elements.
     * Database should be consistent (No double LANRS);
    */
    deleteOneOrMany<T>( collection: string, element: Array<T> | T ): Promise<DeleteWriteOpResultObject> {
        return new Promise<DeleteWriteOpResultObject> ( (resolve, reject) => {
            DatabaseManager.getInstance().getCollection(collection , false)
            .then((myCollection: Collection<any> | Error) => {
                if ( "stack" in myCollection ) {
                    reject(<Error>myCollection);
                }
                if ((<Array<T>>element).copyWithin) {
                    // TODO refactor later for readability
                    let myElements: Array<T> = (<Array<T>>element);
                    // filter all keys that are not LANR
                    myElements.forEach( (oneElement: T) => {
                        Object.keys(oneElement).forEach((key) => ((key !== "LANR" ) && delete(oneElement[key])));
                    });
                    // extract Values of elements out of Array
                    let myLANRs = [];
                    myElements.forEach( (oneElement: T) => {
                        myLANRs.push (Object.keys(oneElement).map((key) => { return oneElement[key]; })[0] );
                    });
                    resolve ((<Collection<any>>myCollection).deleteMany({ "LANR": {"$in": myLANRs }} ));
                } else {
                    resolve((<Collection<any>>myCollection).deleteOne(<T>element));
                }
            });
        })
        .catch((error: Error) => {
            console.log("[doctor/deleteDoctor] error: " + error.message + " " + error.stack);
            return Promise.reject(error);
        });
    }

    /**
     * returns Promise of collection of Data or creates newEntry if collection has not yet existed.
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
}
