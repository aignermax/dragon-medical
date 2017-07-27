REM -> Set PATH Variable to mongoDB folder in programfiles!
REM - Next step would be to add Jenkins Integration to Database for Staging-Database 
REM (copy all Entries from production into staging database with ssh, probably host on Vultr)
REM on vultr we could also use a docker but it's probably easiest to simply use the VM there
REM Also we have to add Usercontrol, then
if not exist "data\db" (
    mkdir "data\db" 
    call :addStandardUser
) else (
    START mongod.exe --dbpath "data\db"
)

goto:eof

:addStandardUser
    START mongod.exe --dbpath "data\db"
    timeout 3
    mongo.exe Dragon --eval "db.user.insert({email:'max_aigneraigner@web.de', name: 'tester' , password: '$2a$04$hKyOOOJPyiSc0ca2xNqCguHwUywRWZPn0P.7H4BbjqwNzH4zKww7u' });"
EXIT /B 0