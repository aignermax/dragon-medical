/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />

import {DatabaseManager} from '../../src/DatabaseManager';
import { expect } from 'chai';

describe("DatabaseManager" , () => {
        
    before( async ()=>{
        await DatabaseManager.getInstance().connect();
    });

    it('should return Instance of DatabaseMgr', async ()=>{
        expect(DatabaseManager.getInstance() , 'Got no instance of Database').to.exist;
    });

    // it('should Throw an error' , async () => {
    //     const result = await DatabaseManager.getInstance().connect();
    //     expect(result).to.equal(true);
    // })

    it('should read Collection', async () =>{
        // Write testUser
        const result = await DatabaseManager.getInstance().getCollection('test');
        // Read testUser
        // Delete testUser

        // Try to read testUser again

    });

    it('should write Collection' , async () => {
        
    });

    it('should write single entry' , async () => {
        
    });

    it ('should read single entry' , async () => {
        
    });

});