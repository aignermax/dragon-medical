/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />

import { Collection, InsertOneWriteOpResult, DeleteWriteOpResultObject} from "mongodb";
import * as doctor from '../../src/doctor';
import { DatabaseManager } from '../../src/DatabaseManager';
import { expect } from 'chai';

describe("doctor" , () => {
    
    before( async ()=>{
        if ( DatabaseManager.getInstance().isconnected() === false){
            console.log("[doctor] reconnecting to Database. IsCon: " + DatabaseManager.getInstance().isconnected());
            //await DatabaseManager.getInstance().connect();
        }
    });

    const myLANR = "2344578978483";
    let myDoc : doctor.Doctor = { 
        address: "hey",
        firstname: "Jochen",
        secondname: "Arzt",
        LANR: myLANR
    };

    it ('should add a doctor' , async () => {
        
        const writeResult: number | Error =  await doctor.write(myDoc);
        expect(writeResult).to.equal(1);
    });

    it('should return one doctor by his LANR', async () => {
        const readResult: any[] | Error = await doctor.getDoctorbyLANR(myLANR);
        //console.log(JSON.stringify(readResult[0]));
        let readDoc = (<any[]>readResult)[0];
        expect(readDoc).to.exist;
        expect(readDoc.LANR).to.equal(myLANR);
        expect(readDoc.address).to.equal(myDoc.address);
        expect(readDoc.firstname).to.equal(myDoc.firstname);
        expect(readDoc.secondname).to.equal(myDoc.secondname);
    });

    it('should read the just added Doctor from database' , async () => {
        const readResult: any[] | Error = await doctor.getOne(myDoc);
        expect (readResult).to.not.have.property("stack", "Error: " + (<Error>readResult).message);
        //console.log(JSON.stringify(readResult));
        let readDoc = (<any[]>readResult)[0];
        expect(readDoc).to.exist;
        expect(readDoc.LANR).to.equal(myLANR);
        expect(readDoc.address).to.equal(myDoc.address);
        expect(readDoc.firstname).to.equal(myDoc.firstname);
        expect(readDoc.secondname).to.equal(myDoc.secondname);
    });

    it('should delete the newly added Doctor successfully' , async () => {
        const delResult: DeleteWriteOpResultObject = await doctor.deleteOneOrMany(myDoc);
        console.log("      [deleteOne] deleted: " + delResult.deletedCount);
        expect(delResult.deletedCount, "did not delete the one doctor").to.equal(1);
    });

    let myDoctors: Array<doctor.Doctor> = []; // needed for the next three tests
    it('should add some Doctors' , async() => {
        myDoctors.push( doctor.createDoctor("Thomas" , "Maier" , "Nebernstraße 10" , "11209243432"));
        myDoctors.push( doctor.createDoctor("Werner" , "Weber" , "Libellostraße 12" , "11235643435"));
        await doctor.write(myDoctors);
        expect(await doctor.getOne(myDoctors[0])).to.exist
        expect(await doctor.getOne(myDoctors[1])).to.exist
    });

    it('should list all doctors', async ()=>{
        let allDoctors: Array<doctor.Doctor> | Error= await doctor.getAll();
        let amountDoctors = (<Array<doctor.Doctor>>allDoctors).length;
        console.log("      [listAll] found:" , amountDoctors , "doctors");
        expect(amountDoctors).to.be.greaterThan(1 , "did not find the two newly added doctors");
    });

    it('should delete a List of Doctors' , async() => {        
        const delResult: DeleteWriteOpResultObject = await doctor.deleteOneOrMany(myDoctors);
        expect(delResult.deletedCount).to.equal(2, "Could not delete the two newly added Doctors.");
    });
    
});
