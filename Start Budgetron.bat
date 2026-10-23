@echo off
REM Start the local Node server and open Budgetron. Keep this window open for AI chat.
REM Prefer installed Node; fall back to the runtime bundled with Codex if available.
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if not errorlevel 1 (
  node server\server.mjs --open
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server\server.mjs --open
) else (
  echo Install Node.js 22 or newer, then run this file again.
)
pause
