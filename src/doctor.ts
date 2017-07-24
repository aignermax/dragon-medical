import {Collection , InsertOneWriteOpResult, DeleteWriteOpResultObject} from "mongodb";

import { DatabaseManager } from "./DatabaseManager";

export const collectionDoctor : string = "doctor";
export interface Doctor {
    firstname: string;
    secondname: string;
    address: string;
    LANR: string;
}

export function getAll(): Promise<Array<any>|Error> {
    return getOne();
}

export function createDoctor(firstname, secondname, address, LANR): Doctor {
    return { firstname, secondname, address, LANR};
}
/** if fed with null, it returns null. */
const removeEmpty = (obj) => {
    if (!obj) { return {}; }
    Object.keys(obj).forEach((key) => (obj[key] == null || obj[key] === "") && delete obj[key]);
    return obj;
};

/** get Doctor by LANR as string */
export function getDoctorbyLANR ( LANR: string): Promise<Array<any>|Error> {
    if (!LANR || Number(LANR) === 0) { return Promise.reject(new Error); } // sanity
    return getOne(createDoctor(null, null, null, LANR));
}
/** returns all doctors where all paramaters of Doctor match.
 * Leave out parameters you don't need by assigning them null or "".
 * example: {firstname = "Aigner" , secondname="" , LANR="", address=""}
 */
export function getOne(doctor: Doctor = null): Promise<Array<Doctor>|Error> {
    return DatabaseManager.getInstance().findEntries<Doctor>( collectionDoctor, removeEmpty(doctor) );
}

/** insert one doctor or multiple doctors at once. */
export function write (doctor: Array<Doctor> | Doctor ): Promise<number | Error> {
    return DatabaseManager.getInstance().writeEntries<Doctor>(collectionDoctor, doctor);
}

/** be careful -> if doctor is empty array, it deletes all documents
 * If doctor is an array, it deletes all elements in Database that have the same LANR as the array-Elements.
 * Database should be consistent (No double LANRS);
*/
export function deleteOneOrMany( doctor: Array<Doctor> | Doctor ): Promise<DeleteWriteOpResultObject> {
    return DatabaseManager.getInstance().deleteOneOrMany<Doctor>( collectionDoctor, doctor);
}
