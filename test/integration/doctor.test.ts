/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />

import { Collection } from "mongodb";
import * as doctor from '../../src/doctor';
import { DatabaseManager } from '../../src/DatabaseManager';
import { expect } from 'chai';

describe("doctor" , () => {
    before(function() {
       DatabaseManager.getInstance().connect();
    });
        
    it ('should add a doctor' , async () => {
        const result = await DatabaseManager.getInstance().getCollection("doctor");
        //console.log("[Doctor.test]" , result);
        expect(result).to.exist;
    });
    it('should list all doctors', ()=>{
        expect(DatabaseManager.getInstance() , 'Got no instance of Database').to.exist;
    });
});
