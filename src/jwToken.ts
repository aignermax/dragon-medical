
import * as jwt from "jsonwebtoken";
let tokenSecret: string = "Li€b3894838f9da8*~!";

export function issue (payload: any): string {
  console.log("jwToken: " , payload);
  return jwt.sign(payload, tokenSecret, {
    expiresIn : 200 * 60
  });
}

// check if an external sent token is valid (in a request)
export function verify (token: string, callback: any): any  {
    return jwt.verify(token, tokenSecret, callback);
}

// check if token is valid and return promise
export function verifyPromise( token: string ): Promise<any | Error> {
        return new Promise ( function(resolve, reject) {
            verify( token , (err: Error, decodedToken: string) => {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        return reject(err);
                    } // just to show you it could be this error
                    return reject(err);
                } else {
                    return resolve(decodedToken);
                }
            });
        });
    }
