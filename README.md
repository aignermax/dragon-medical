# DragonMedical

## Setup

To setup the project do the following steps:

1. check out the repository
2. install node 8 and npm 5 on your system
3. do a `npm install` in the repository path

## Building the package

Run `npm run build` or `npm run build-watch` to execute building with
 watching for file changes.
 
## Running the server

Run `node dist/index.js` or `npm start`.

## Running tslint to check your code:

Run `npm run tslint`.

## Accessing the server

The server will start on `http://localhost:8080`.
The RPC-Interface needs POST-Messages so only those are implemented yet.

You can use the Chrome Extension `Postman` (https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop) to test your requests. 
