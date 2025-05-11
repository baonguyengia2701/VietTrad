@echo off
echo === Starting VietTrad Demo ===
echo.
echo 1. Installing dependencies...
cd server && npm install
cd ../client && npm install
cd ..
echo.
echo 2. Starting server...
start cmd /k "cd server && npm run dev"
echo.
echo 3. Starting client...
echo Wait for the server to start before continuing...
timeout /t 5
start cmd /k "cd client && npm start"
echo.
echo === Demo started ===
echo Server running at: http://localhost:5000
echo Client running at: http://localhost:3000
echo.
echo Press any key to exit this window. The demo will continue running in other command prompts.
pause 