/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/chai/index.d.ts" />

import { expect } from 'chai';
import {IncomingMessage, ServerResponse} from "http";
import {Router, postData} from "../../src/Router";
import {DragonServer} from "../../src/DragonServer";
import * as webrequest from 'web-request';
import * as doctor from "../../src/doctor";
import * as user from "../../src/user";

let token: string = "";
let mainPassword = "complicatedPfddW32";
let mainUser: user.User = user.createUserObject("max_aigneraigner@mail.de" , "tester" , mainPassword);

/** makes an API Request with custom inputdata */
async function reqRaw( inputdata: any):Promise<any> {
    let url:string = "http://localhost:8080/";
    let options:webrequest.RequestOptions = {
        method: 'post',
        headers: {"Authorization": "Bearer " + token}
    };
    let data: webrequest.Response<string> = await webrequest.post(url , options , JSON.stringify(inputdata) );
    return JSON.parse(data.content);
}
/** makes an API request with queryDoctors formatted data */
function req( method:string , queryDoctors: Array<doctor.Doctor> | any = null ): Promise<any> {
    let inputdata: postData = {
        class: "doctor",
        method,
        queryDoctors
    };
    return reqRaw(inputdata );
}

function login(user: user.User ): Promise<string> {
    return reqRaw({method: "login", class:"doctor", email: user.email, password: user.password })
    .then((data) => {
        if (data.doctor && data.doctor.token) {
            return Promise.resolve<string> (data.doctor.token);
        } else {
            return Promise.reject<string> (" Error -> did not receive token, but: " + JSON.stringify(data));
        }
    })
    .catch((error)=>{
        return Promise.reject(error);
    });
};

describe ("Router" , () => {

    before( async () => {
        await DragonServer.getInstance()
            .start((request: IncomingMessage, response: ServerResponse
                , pathname: string, data: string) => {
                Router.getInstance().handle(request, response, pathname, data);
            });
            // create user in Database so that we can login as that user
            await user.write( mainUser );
            mainUser.password = mainPassword;
            token = await login( mainUser );
    });
    after( async() => {
        // cleanUp User from Database
        user.deleteUser(mainUser);
    });
    let refDoctor1 = doctor.createDoctor("Samuel" , "Fleischmann" , "Grünweg 3" , "787643449");
    let refDoctor2 = doctor.createDoctor("Leopold" , "Metzger" , "Bachstraße 5" , "45328908")
    let doctorList: Array<doctor.Doctor> = [refDoctor1 , refDoctor2];
    
    // TODO -> Unify the response of the requests to a schema. 
    // -> isSuccess:boolean , number: number, object: object/array
    // TODO -> finish spec YAML File 

    it ( "should add a doctor" , async () => {
        let result: any = await req("write" , [refDoctor1]);
        expect(result).to.exist;
        expect(result.success).to.equal(true, "expected result.success to be true, but got: " + JSON.stringify(result));
    });
    
    it ( "should get a doctor" , async () => {
        let getResult: any = await req("get" , [refDoctor1]);
        expect(getResult.doctor).to.not.equal( undefined , "received: " + JSON.stringify(getResult));
        expect(getResult.doctor.length).to.equal(1 , "expected list of one, but got: " + JSON.stringify(getResult));
    });

    it ( "should delete a doctor" , async () => {
        await req("delete" , [refDoctor1]);
        let result: any = await req("get" , [refDoctor1]);
        expect(result.doctor).to.not.equal( undefined , "received: " + JSON.stringify(result));
        expect( result.doctor.length).to.equal(0, "doctor still in database- deletion did not work");
    });
    
    it ( "should add two doctor" , async () => {
        let result: any = await req("write", doctorList);
        expect(result.doctor).to.not.equal( undefined , "received: " + JSON.stringify(result));
        expect(result.doctor).to.equal(2 , "expected 2, but got: " + result.doctor + " in response: " + result);
    });

    it ( "should get all doctors " , async () => {
        let result: any = await req("getAll");
        expect(result.doctor).to.not.equal( undefined , "received: " + JSON.stringify(result));
        expect(result.doctor.length).to.equal(2 , "could not read proper amount of previously saved doctors");
    });

    it ( "should delete the two newly added doctors " , async () => {
        let result: any = await req("delete", doctorList);
        expect(result.doctor).to.not.equal( undefined , "received: " + JSON.stringify(result));
        expect(result.doctor.n).to.equal(2, " expected 2, but got: " + JSON.stringify(result));
        let result1: any = await req("get" , [refDoctor1]);
        expect( result1.doctor.length).to.equal (0, " doctor still in database- deletion did not work");
        let result2: any = await req("get" , [refDoctor1]);
        expect( result2.doctor.length).to.equal (0, " doctor still in database- deletion did not work");
    });
});
