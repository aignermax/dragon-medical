import {Collection} from "mongodb";

import {DatabaseManager} from "./DatabaseManager";

export interface Doctor {
    firstname: String;
    secondname: String;
    address: String;
    LANR: String;
}

export function getAll(): Promise<Array<any>|Error> {
    return getDoctor();
}

export function getDoctor(doctor: Doctor = null): Promise<Array<any>|Error> {
    // setup Search Parameters for DatabaseManager
    let queryObject: any = { };
    if (doctor) {
        queryObject = Object.keys(doctor).filter((value: string) => {
            // let through only non-empty strings
            if (doctor[value] || (doctor[value] === "0")) {
                console.log(doctor[value] , " " , value);
                return doctor[value];
            }
        });
    }
    // return search Promise
    return DatabaseManager.getInstance().getCollection("doctor")
        .then((collection: Collection) => {
            return collection.find(queryObject).toArray();
        });
}

export function deleteDoctor(doctor: Doctor): Promise<void|Error> {
    return new Promise<void|Error> ( (resolve, reject) => {
        const result = DatabaseManager.getInstance().deleteElement(
            DatabaseManager.getInstance().getCollection("doctor" , false)[0], doctor);
    })
    .catch((error: Error) => {
        console.log("[doctor.ts] error: " , error.stack);
        return Promise.reject(error);
    });
}
