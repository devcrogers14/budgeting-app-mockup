@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if not errorlevel 1 (
  node server\server.mjs
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server\server.mjs
) else (
  echo Install Node.js 22 or newer, then run this file again.
)
pause
