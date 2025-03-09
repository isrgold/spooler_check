@echo off
setlocal EnableDelayedExpansion

REM Define variables
set "TaskName=CheckPrintSpooler"
set "ScriptPath=%~dp0check_spooler.bat"
set "LogPath=C:\SpoolerCheck.log"
set "JobsFilePath=C:\PersistentJobs.txt"
set "AdminEmail=admin@company.com"

REM Check if running as admin (required for schtasks and service control)
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo This script must be run as Administrator. Right-click and select "Run as Administrator".
    pause
    exit /b 1
)

REM Create the spooler check script if it doesn't exist
if not exist "%ScriptPath%" (
    echo Creating spooler check script at %ScriptPath%...
    (
        echo @echo off
        echo setlocal EnableDelayedExpansion
        echo echo Checking Print Spooler status at %%date%% %%time%% ^>^> %LogPath%
        echo.
        echo REM Check if the Spooler service is running
        echo sc query Spooler ^| find "RUNNING"
        echo if %%ERRORLEVEL%% NEQ 0 (
        echo     echo Print Spooler is NOT running. Attempting to restart... ^>^> %LogPath%
        echo     net start Spooler
        echo     if %%ERRORLEVEL%% EQU 0 (
        echo         echo Print Spooler restarted successfully. ^>^> %LogPath%
        echo     ^) else (
        echo         echo Failed to restart Print Spooler. Check manually. ^>^> %LogPath%
        echo     ^)
        echo ^) else (
        echo     REM If running, check for print jobs
        echo     echo Checking for print jobs... ^>^> %LogPath%
        echo     
        echo     REM Create a temp file with current job listing
        echo     set "CurrentJobsFile=%%TEMP%%\current_jobs.txt"
        echo     dir "C:\Windows\System32\spool\PRINTERS" /b ^> "!CurrentJobsFile!"
        echo     
        echo     REM Check if we have any jobs
        echo     findstr /R . "!CurrentJobsFile!" ^>nul
        echo     if %%ERRORLEVEL%% EQU 0 (
        echo         echo Print jobs detected in queue. ^>^> %LogPath%
        echo         
        echo         REM Check if previous jobs file exists
        echo         if exist "%JobsFilePath%" (
        echo             echo Comparing with previous job listing... ^>^> %LogPath%
        echo             
        echo             REM Find persistent jobs (files that exist in both current and previous checks)
        echo             for /F "tokens=*" %%%%j in ^('type "!CurrentJobsFile!"'^) do (
        echo                 findstr /L /X "%%%%j" "%JobsFilePath%" ^>nul
        echo                 if %%ERRORLEVEL%% EQU 0 (
        echo                     echo PERSISTENT JOB DETECTED: %%%%j ^>^> %LogPath%
        echo                     
        echo                     REM Send email notification about persistent job
        echo                     if exist "C:\Windows\System32\blat.exe" (
        echo                         echo Sending email notification... ^>^> %LogPath%
        echo                         echo Print job %%%%j has been stuck in the queue for multiple checks. ^| blat - -to %AdminEmail% -subject "ALERT: Stuck Print Job Detected"
        echo                         echo Email notification sent. ^>^> %LogPath%
        echo                     ^) else (
        echo                         echo Email notification tool ^(blat^) not found. Cannot send alert. ^>^> %LogPath%
        echo                     ^)
        echo                     
        echo                     REM Optional: Attempt to clear just this specific stuck job
        @REM echo                     echo Attempting to clear persistent job... ^>^> %LogPath%
        @REM echo                     net stop Spooler
        @REM echo                     timeout /t 3 /nobreak ^>nul
        @REM echo                     del /q "C:\Windows\System32\spool\PRINTERS\%%%%j" 2^>nul
        @REM echo                     net start Spooler
        @REM echo                     echo Spooler restarted after attempting to clear stuck job. ^>^> %LogPath%
        echo                 ^)
        echo             ^)
        echo         ^)
        echo         
        echo         REM Save current jobs for next comparison
        echo         copy /y "!CurrentJobsFile!" "%JobsFilePath%" ^>nul
        echo         echo Updated persistent jobs tracking file. ^>^> %LogPath%
        echo     ^) else (
        echo         echo No print jobs in queue. ^>^> %LogPath%
        echo         if exist "%JobsFilePath%" del "%JobsFilePath%"
        echo     ^)
        echo     
        echo     del "!CurrentJobsFile!" ^>nul 2^>^&1
        echo ^)
        echo.
        echo REM Log rotation to prevent massive log files
        echo for %%%%A in ^("%%LogPath%%"^) do set "LogSize=%%%%~zA"
        echo if defined LogSize ^(
        echo     if !LogSize! GTR 1048576 ^(
        echo         echo Log file exceeded 1MB, rotating... ^>^> %%LogPath%%
        echo         copy /y "%%LogPath%%" "%%LogPath%%.old" ^> nul
        echo         echo New log started %%date%% %%time%% ^> "%%LogPath%%"
        echo     ^)
        echo ^)
        echo.
        echo echo --- ^>^> %LogPath%
    ) > "%ScriptPath%"
    echo Spooler check script created.
) else (
    echo Spooler check script already exists at %ScriptPath%.
)

REM Check if the task already exists
schtasks /query /tn "%TaskName%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Task "%TaskName%" already exists. Deleting it...
    schtasks /delete /tn "%TaskName%" /f
)

REM Create the scheduled task to run every 5 minutes
echo Creating scheduled task "%TaskName%"...
schtasks /create /tn "%TaskName%" /tr "%ScriptPath%" /sc minute /mo 5 /ru "SYSTEM" /rl HIGHEST
if %ERRORLEVEL% EQU 0 (
    echo Task successfully created to run every 5 minutes.
) else (
    echo Failed to create task. Check your permissions or syntax.
    pause
    exit /b 1
)

echo Setup complete. Email notifications will be sent to %AdminEmail% when print jobs are stuck for multiple checks.
echo Logs will be written to %LogPath%.
pause