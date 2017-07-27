# DragonServer                                        
## install modules (after cloning)
`npm install`

## setup MongoDB locally
download & install mongoDB from https://www.mongodb.com/download-center

(windows): run batch file `startmongo.bat` to create mongo-folder and start mongod server on localhost

(linux/mac): create folder data/db in project and run 

`mongod --dbpath "data\db"`

to choose that folder, then, (Linux only) add testuser -> 

`mongo Dragon --eval "db.user.insert({email:'max_aigneraigner@web.de', name: 'tester' , password: '$2a$04$hKyOOOJPyiSc0ca2xNqCguHwUywRWZPn0P.7H4BbjqwNzH4zKww7u' });"`

(in windows this is done in the batch script)

## run Unit Tests
`npm run pretest`

`npm run test`

## build & start Server and connect with postman!
`npm run build`

or 

`npm run build-watch`

`npm start`

-> the postman collection is called "Red Medical.postman_collection.json". Import that into postman.

## Running tslint to check your code:
Run `npm run tslint`.

## Accessing the server
The server will start on `http://localhost:8080`