
import { expect } from 'chai';


import * as user from "../../src/user";
import { DeleteWriteOpResultObject } from "mongodb";
import * as jwToken from "../../src/jwToken";

let password = "complicatedPW32";
let exampleUser1: user.User = user.createUserObject("max_aigneraigner@web.de" , "Emil Egner" , password);
let exampleUser2: user.User = user.createUserObject("test@web.de" , "Mustafa Musterfahr" , password);

describe("User" , async () => {
    it ("Should write a user to Database", async () => {
        let result = await user.write(exampleUser1);
        expect( result).to.equal(1, " adding User did not work because:" + result );
    });
    it("Should generate a Webtoken and verify it." , async () => {
        let result2 = await user.login(exampleUser1.email, password);
        jwToken.verify( result2.token , (err, decodedToken) => {
            expect ( err).to.not.exist;
            if (err) {
                expect ( err.name).to.not.equal('TokenExpiredError'); // just to show you it could be this error
            }
            console.log( "decrypted Token" , decodedToken);
            expect (decodedToken).to.be.not.empty;
        });
        expect( result2 ).to.exist;
        expect( result2.stack).to.not.exist;
        expect( result2.token).to.be.not.empty;
    });

    it ("Should delete newly added users" , async() => {
        let resultDelete: DeleteWriteOpResultObject = await user.deleteUser(exampleUser1);
        expect( resultDelete.deletedCount).to.equal(1 , "should delete one, but deleted: " + resultDelete.deletedCount);
    });
});