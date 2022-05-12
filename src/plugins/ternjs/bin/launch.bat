@echo off
set ccd=%CD%
cd E:\\Development\\Projects\\NodeJS\\custom_modules\\webserverlite\\
node ./main.js -config="%ccd%\\config.json"