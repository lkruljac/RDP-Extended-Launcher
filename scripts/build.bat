@echo off
call "C:\Program Files\Microsoft Visual Studio\18\Enterprise\Common7\Tools\VsDevCmd.bat" -arch=x64
cd /d "%~dp0..\app"
npm run tauri build
pause
