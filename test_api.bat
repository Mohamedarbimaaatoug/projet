@echo off
echo =============================================
echo    HOTEL PARADIS - TEST API COMPLET
echo =============================================
echo.

echo [1] Health check backend...
curl -s http://localhost:5000/api/health
echo.
echo.

echo [2] Login client Sophie...
curl -s -X POST http://localhost:5000/api/guests/login -H "Content-Type: application/json" -d "{\"name\":\"Sophie Martin\",\"email\":\"sophie.martin@test.com\",\"phone\":\"0611223344\",\"roomNumber\":\"302\"}"
echo.
echo.

echo [3] Recuperation ID client Sophie...
for /f "tokens=*" %%i in ('curl -s http://localhost:5000/api/guests') do set GUESTS=%%i
echo %GUESTS%
echo.

echo [4] Login Admin...
curl -s -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"hotel2025\"}"
echo.
echo.

echo [5] Login Chef Maintenance...
curl -s -X POST http://localhost:5000/api/chef/login -H "Content-Type: application/json" -d "{\"username\":\"maintenance\",\"password\":\"maint2025\"}"
echo.
echo.

echo [6] Liste des comptes chefs...
curl -s http://localhost:5000/api/chef/accounts
echo.
echo.

echo [7] Statistiques dashboard...
curl -s http://localhost:5000/api/stats
echo.
echo.

echo =============================================
echo    TEST TERMINE
echo =============================================
pause
