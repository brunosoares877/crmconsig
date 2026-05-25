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
    rem pause
    exit /b 1
)

echo.
echo [2/4] Fazendo login no Vercel...
rem call vercel login
...
call vercel --yes
...
call vercel --prod --yes

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
rem pause 