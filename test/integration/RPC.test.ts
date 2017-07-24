/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />

import { expect } from 'chai';
import {IncomingMessage, ServerResponse} from "http";
import {Router, postData} from "../../src/Router";
import {DragonServer} from "../../src/DragonServer";
import * as webrequest from 'web-request';
import * as doctor from "../../src/doctor";
import * as user from "../../src/user";
import { DeleteWriteOpResultObject } from "mongodb";

async function req( method:string , queryDoctors: Array<doctor.Doctor> = null ): Promise<postData> {
    let url:string = "http://localhost:8080/";
    let inputdata: postData = {
        class: "doctor",
        method,
        queryDoctors
    };
    let options:webrequest.RequestOptions = {
        method: 'post',
        body: {body:JSON.stringify(inputdata)}
    };
    let data: webrequest.Response<string> = await webrequest.post(url , options , JSON.stringify(inputdata) );
    //console.log( "response: " + data.statusCode + " \ncontent: " + data.content);
    return JSON.parse(data.content);
}

describe ("Router" , () => {
    before( async () => {
        await DragonServer.getInstance()
            .start((request: IncomingMessage, response: ServerResponse
                , pathname: string, data: string) => {
                Router.getInstance().handle(request, response, pathname, data);
            });

            // TODO -> Login before testing these functions.
    });

    let refDoctor1 = doctor.createDoctor("Samuel" , "Fleischmann" , "Grünweg 3" , "787643449");
    let refDoctor2 = doctor.createDoctor("Leopold" , "Metzger" , "Bachstraße 5" , "45328908")
    let doctorList: Array<doctor.Doctor> = [refDoctor1 , refDoctor2];
    
    // TODO -> Unify the response of the requests to a schema. 
    // -> isSuccess:boolean , number: number, object: object/array
    // TODO -> finish spec YAML File 

    it ( "should add a doctor" , async () => {
        let result: any = await req("write" , [refDoctor1]);
        expect(result.success).to.equal(true, "expected result.success to be true, but got: " + result);
    });
    
    it ( "should get a doctor" , async () => {
        let result: any = await req("get" , [refDoctor1]);
        expect(result.doctor.length).to.equal(1 , "expected list of one, but got: " + result);
    });

    it ( "should delete a doctor" , async () => {
        await req("delete" , [refDoctor1]);
        let result: any = await req("get" , [refDoctor1]);
        expect( result.doctor.length).to.equal(0, "doctor still in database- deletion did not work");
    });
    
    it ( "should add two doctor" , async () => {
        let result: any = await req("write", doctorList);
        expect(result.doctor).to.equal(2 , "expected 2, but got: " + result.doctor + " in response: " + result);
    });

    it ( "should get all doctors " , async () => {
        let result: any = await req("getAll");
        expect(result.doctor.length).to.equal(2 , "could not read proper amount of previously saved doctors");
    });

    it ( "should delete the two newly added doctors " , async () => {
        let result: any = await req("delete", doctorList);
        expect(result.doctor.n).to.equal(2, " expected 2, but got: " + JSON.stringify(result));
        let result1: any = await req("get" , [refDoctor1]);
        expect( result1.doctor.length).to.equal (0, " doctor still in database- deletion did not work");
        let result2: any = await req("get" , [refDoctor1]);
        expect( result2.doctor.length).to.equal (0, " doctor still in database- deletion did not work");
    });


    let exampleUser1: user.User = user.createUser("max_aigneraigner@web.de" , "Emil Egner" , "password");
    let exampleUser2: user.User = user.createUser("test@web.de" , "Mustafa Mustamun" , "gleichesPW");

    describe("Login Logout" , async () => {
        it ("Should create a user in Database", async () => {
            let result = await user.write(exampleUser1);
            expect( result).to.equal(1, " adding User did not work because:" + result );
        });
        it("Should generate a Webtoken" , async () => {
            let result2 = await user.login(exampleUser1.email, exampleUser1.password);
            expect( result2.stack).to.not.exist("error occured: " + JSON.stringify(result2));
            expect( result2.token).to.be.not.empty(" adding User did not work because:" + result2 );
        });

        it ("Should delete newly added users" , async() => {
            let resultDelete: DeleteWriteOpResultObject = await user.deleteUser(exampleUser1);
            expect( resultDelete.deletedCount).to.equal(1 , "should delete one, but deleted: " + resultDelete.deletedCount);
        });
    });
});

