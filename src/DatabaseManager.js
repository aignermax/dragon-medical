Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class DatabaseManager {
    constructor() {
        if (DatabaseManager._instance) {
            throw new Error("Error: instantiation failed: Use DatabaseManager.getInstance() instead of new.");
        }
        DatabaseManager._instance = this;
    }
    static getInstance() {
        return DatabaseManager._instance;
    }
    connect() {
        if (this.mongoClient) {
            return Promise.reject(new Error("mongo client instance already exists"));
        }
        this.mongoClient = new mongodb_1.MongoClient();
        return this.mongoClient.connect("mongodb://localhost:27017/Dragon").then((db) => {
            this.dragonDatabase = db;
            return true;
        });
    }
    getCollection(name) {
        return new Promise((resolve, reject) => {
            if (!this.dragonDatabase) {
                reject(new Error("not connected"));
                return;
            }
            this.dragonDatabase.collection(name, (error, collection) => {
                if (!collection) {
                    reject(error);
                }
                else {
                    resolve(collection);
                }
            });
        }).catch((error) => {
            if (error.message === "not connected") {
                return Promise.reject(error);
            }
            // collection does not seam to exist --> try to create
            return this.dragonDatabase.createCollection(name);
        });
    }
}
DatabaseManager._instance = new DatabaseManager();
exports.DatabaseManager = DatabaseManager;
