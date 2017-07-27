REM - Next step would be to add Jenkins Integration to Database for Staging-Database 
REM (copy all Entries from production into staging database with ssh, probably host on Vultr)
REM on vultr we could also use a docker but it's probably easiest to simply use the VM there
REM Also we have to add Usercontrol, then
if not exist "data\db" mkdir "data\db"
mongod.exe --dbpath "data\db"