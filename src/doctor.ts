import {Collection , InsertOneWriteOpResult, DeleteWriteOpResultObject} from "mongodb";

import {DatabaseManager} from "./DatabaseManager";

export const collectionDoctor : string = "doctor";
export interface Doctor {
    firstname: string;
    secondname: string;
    address: string;
    LANR: string;
}

export function getAll(): Promise<Array<any>|Error> {
    return getDoctor();
}

export function createDoctor(firstname, secondname, address, LANR): Doctor {
    return { firstname, secondname, address, LANR};
}
/** get Doctor by LANR as string */
export function getDoctorbyLANR ( LANR: string): Promise<Array<any>|Error> {
    if (!LANR || Number(LANR) === 0) { return Promise.reject(new Error); } // sanity
    return getDoctor(createDoctor(null, null, null, LANR));
}

const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === "") && delete obj[key]);
  return obj;
};

/** returns all doctors where all paramaters of Doctor match.
 * Leave out parameters you don't need by assigning them null or "".
 * example: {firstname = "Aigner" , secondname="" , LANR="", address=""}
 */
export function getDoctor(doctor: Doctor = null): Promise<Array<any>|Error> {
    // return search Promise
    return DatabaseManager.getInstance().getCollection(collectionDoctor)
        .then((collection: Collection) => {
            return collection.find(removeEmpty(doctor)).toArray();
        });
}

/** insert one doctor or multiple doctors at once. */
export function writeDoctors (doctor: Array<Doctor> | Doctor ): Promise<InsertOneWriteOpResult> {
    return new Promise<InsertOneWriteOpResult> ((resolve, reject) => {
        DatabaseManager.getInstance().getCollection(collectionDoctor)
        .then((collection: Collection<any>) => {
            if ((<Array<Doctor>>doctor).map) {
                resolve ( DatabaseManager.getInstance().insertElements(collection, <Array<Doctor>>doctor));
            } else {
                resolve ( DatabaseManager.getInstance().insertElement(collection, <Doctor>doctor));
            }
        });
    })
    .catch( (error: Error) => {
        console.log("[doctor/writeDoctors] error: " + error.message + " " + error.stack );
        return Promise.reject(error);
    });
}

/** be careful -> if doctor is empty array, it deletes all documents
 * If doctor is an array, it deletes all elements in Database that have the same LANR as the array-Elements.
 * Database should be consistent (No double LANRS);
*/
export function deleteDoctors( doctor: Array<Doctor> | Doctor ): Promise<DeleteWriteOpResultObject> {
    return new Promise<DeleteWriteOpResultObject> ( (resolve, reject) => {
        DatabaseManager.getInstance().getCollection(collectionDoctor , false)
        .then((collection: Collection<any> | Error) => {
            if ( "stack" in collection ) {
                reject(<Error>collection);
            }
            if ((<Array<Doctor>>doctor).copyWithin) {
                // TODO refactor later for readability
                let myDoctors: Array<Doctor> = (<Array<Doctor>>doctor);
                // filter all keys that are not LANR
                myDoctors.forEach( (oneDoctor) => {
                    Object.keys(oneDoctor).forEach((key) => ((key !== "LANR" ) && delete(oneDoctor[key])));
                });
                // extract Values of elements out of Array
                let myLANRs = [];
                myDoctors.forEach( (oneDoctor) => {
                    myLANRs.push (Object.keys(oneDoctor).map((key) => { return oneDoctor[key]; })[0] );
                });
                resolve ((<Collection<any>>collection).deleteMany({ "LANR": {"$in": myLANRs }} ));
            } else {
                resolve((<Collection<any>>collection).deleteOne(<Doctor>doctor));
            }
        });
    })
    .catch((error: Error) => {
        console.log("[doctor/deleteDoctor] error: " + error.message + " " + error.stack);
        return Promise.reject(error);
    });
}
