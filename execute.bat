@echo off

:: Compile the TypeScript file using npx
npx tsc test.ts
if %ERRORLEVEL% neq 0 (
    echo TypeScript compilation failed.
    exit /b %ERRORLEVEL%
)

:: Run the compiled JavaScript file
node test.js
if %ERRORLEVEL% neq 0 (
    echo Execution of test.js failed.
    exit /b %ERRORLEVEL%
)
