
import { expect } from 'chai';
import {IncomingMessage, ServerResponse} from "http";
import {Router, postData} from "../../src/Router";
import {DragonServer} from "../../src/DragonServer";
import { DatabaseManager } from '../../src/DatabaseManager';
import * as webrequest from 'web-request';
import * as doctor from "../../src/doctor";
import * as user from "../../src/user";

let token: string = "";
let mainPassword = "complicatedPfddW32";
let mainUser: user.User = user.createUserObject("max_aigneraigner@mail.de" , "tester" , mainPassword);

/** makes an API Request with custom inputdata */
async function reqRaw( inputdata: any):Promise<any> {
    let result:any = {};
    let url:string = "http://localhost:8080/";
    let options:webrequest.RequestOptions = {
        method: 'post',
        headers: {"Authorization": "Bearer " + token}
    };
    let data: webrequest.Response<string> = await webrequest.post(url , options , JSON.stringify(inputdata) );
    try {
        result = JSON.parse(data.content);
    } catch (error) {
        return Promise.reject(new Error("Error -> could not parse data" + data.content + " " + error))
    }
    return result
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        if ( DatabaseManager.getInstance().isconnected() === false){
            console.log("[doctor] reconnecting to Database. IsCon: " + DatabaseManager.getInstance().isconnected());
            await DatabaseManager.getInstance().connect("doctor.test");
        }
        await DragonServer.getInstance()
            .start((request: IncomingMessage, response: ServerResponse
                , pathname: string, data: string) => {
                Router.getInstance().handle(request, response, pathname, data);
            });
            // create user in Database so that we can login as that user
            await user.write( mainUser );
            await setTimeout(()=>{ } , 100);
            mainUser.password = mainPassword;
            token = await login( mainUser );
            await setTimeout(()=>{ } , 100);
    });
    after( async() => {
        // cleanUp User from Database
        await user.deleteUser(mainUser);
    });
    let refDoctor1 = doctor.createDoctor("Samuel" , "Fleischmann" , "Grünweg 3" , "787643449");
    let refDoctor2 = doctor.createDoctor("Leopold" , "Metzger" , "Bachstraße 5" , "45328908")
    let doctorList: Array<doctor.Doctor> = [refDoctor1 , refDoctor2];

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

    it("should block because of double sending" , async() => {
        await sleep(20);
        let throttlecount = 0;
        let passedcount = 0;
        for( let i = 1 ; i < 20 ; i++){
            await sleep(2);
            login(mainUser)
            .then( (data ) =>{
                passedcount ++;
            })
            .catch( (error: any) => {      
                throttlecount ++;
            });
        }
        await sleep(10);
        console.log("      throttled" , throttlecount , "passed" , passedcount);
        expect( passedcount).to.be.greaterThan(2 , "Not a single Request came through -> something expected about 3-4");
        expect( throttlecount).to.be.greaterThan(3 , "Not a single Request was blocked! -> something expected about 6-7");
    });

    it( "should remove newly added user" , async () => {
        let result = await user.deleteUser(mainUser);
        expect(result.deletedCount).to.equal(1 , "could not delete user: " + JSON.stringify(mainUser));
    });
});
