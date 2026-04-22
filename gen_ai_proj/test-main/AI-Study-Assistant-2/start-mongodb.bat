@echo off
echo Starting MongoDB...
net start MongoDB
if %errorlevel% equ 0 (
    echo MongoDB started successfully!
    echo You can now run: npm start
) else (
    echo Failed to start MongoDB.
    echo Please make sure MongoDB is installed from: https://www.mongodb.com/try/download/community
    echo Then run this script again.
)
pause
