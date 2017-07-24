
import * as jwt from "jsonwebtoken";
let tokenSecret: string = "Li€b3894838f9da8*~!";

export function issue (payload: string): string {
  console.log("jwToken: " , payload);
  console.log("jwToken: " , tokenSecret);
  return jwt.sign(payload, tokenSecret, {
    expiresIn : 200 * 60
  });
}

// check if an external sent token is valid (in a request)
export function verify (token: string, callback: any): any  {
    return jwt.verify(token, tokenSecret, callback);
}
