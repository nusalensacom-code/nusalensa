@echo off
title Push NusaLensa to GitHub
echo ====================================================
echo   Mengirim Kode NusaLensa ke GitHub...
echo ====================================================
echo.
set "PATH=%LOCALAPPDATA%\Programs\Git\cmd;%LOCALAPPDATA%\Programs\Git\ucrt64\bin;%PATH%"
cd /d "C:\Users\admin\Documents\nusalensa"
git config --global credential.helper manager
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================================
    echo   BERHASIL! Kode NusaLensa sudah masuk ke GitHub!
    echo ====================================================
) else (
    echo Gagal melakukan push.
)
pause
