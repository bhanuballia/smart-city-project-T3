@echo off
echo 🚀 Starting Smart City Backend Server...
echo.

REM Set environment variables
set MONGO_URI=mongodb://localhost:27017/smartcity
set JWT_SECRET=your_jwt_secret_key_here
set PORT=5000
set NODE_ENV=development

echo 📊 Environment Variables:
echo   - MONGO_URI: %MONGO_URI%
echo   - PORT: %PORT%
echo   - NODE_ENV: %NODE_ENV%
echo.

REM Start the server
node server.js

pause
