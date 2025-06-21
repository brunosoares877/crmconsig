@echo off
echo.
echo ================================
echo    DEPLOY LEADCONSIG.COM.BR
echo ================================
echo.

echo [1/4] Verificando build...
call npm run build
if %errorlevel% neq 0 (
    echo Erro no build! Verifique os erros acima.
    pause
    exit /b 1
)

echo.
echo [2/4] Fazendo login no Vercel...
call vercel login

echo.
echo [3/4] Configurando projeto...
call vercel

echo.
echo [4/4] Deploy em producao...
call vercel --prod

echo.
echo ================================
echo     DEPLOY CONCLUIDO!
echo ================================
echo.
echo Proximos passos:
echo 1. Copie a URL do Vercel mostrada acima
echo 2. Acesse https://vercel.com/dashboard
echo 3. Configure o dominio leadconsig.com.br
echo 4. Configure DNS na Hostinger
echo.
pause 