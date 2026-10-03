@echo off
title EtiquetaPro - Servidor y Aplicacion
echo ========================================================
echo   ETIQUETA PRO v1.0 - Iniciando Servidor Multi-Dispositivo
echo ========================================================
echo.
echo Abriendo servidor local y acceso Wi-Fi...
cd /d "%~dp0"
npm run dev
pause
