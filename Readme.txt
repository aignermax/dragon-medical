   / /  / /  / /  / /  / /  / /  / /  / /  / /  / /  / /
 -/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/-
-/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/- 
/ /  / /  / /  / /  / /  / /  / /  / /  / /  / /  / /   
                                                        
                                                        
  ___                          __,                      
 ( / \                        (                         
  /  /_   __,  _,  __ _ _      `.  _  _   _  ,__  _     
(/\_// (_(_/(_(_)_(_)/ / /_  (___)(/_/ (_/ |/ (/_/ (_   
               /|                                       
              (/                                        
   / /  / /  / /  / /  / /  / /  / /  / /  / /  / /  / /
 -/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/-
-/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/--/-/- 
/ /  / /  / /  / /  / /  / /  / /  / /  / /  / /  / /   
                                                        
                                                        
################################################
1. install modules (after cloning)
    npm install

################################################
2. setup MongoDB locally
    download & install mongoDB from https://www.mongodb.com/download-center
    (windows): run batch file "startmongo.bat" to create mongo-folder and start mongod server on localhost
    (linux/mac): create folder data/db in project and run 
    mongod --dbpath "data\db"
    to choose that folder, then, (Linux only) add testuser -> mongo Dragon --eval "db.user.insert({email:'max_aigneraigner@web.de', name: 'tester' , password: '$2a$04$hKyOOOJPyiSc0ca2xNqCguHwUywRWZPn0P.7H4BbjqwNzH4zKww7u' });"
    (in windows this is done in the batch script)

################################################
3. run Unit Tests
    npm run pretest
    npm run test

################################################
4. (re) - build & start Server and connect with postman!
    npm run build
    npm start
    -> the postman collection is called "Red Medical.postman_collection.json". Import that into postman.