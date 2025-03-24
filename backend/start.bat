@echo off
echo スニダン価格監視アプリケーションを起動しています...
echo.

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python がインストールされていません。
    echo Python 3.8 以上をインストールしてください: https://www.python.org/downloads/
    echo.
    pause
    exit /b
)

REM Check if virtual environment exists
if not exist venv (
    echo 仮想環境を作成しています...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo 仮想環境の作成に失敗しました。
        pause
        exit /b
    )
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install requirements if needed
if not exist venv\Lib\site-packages\flask (
    echo 必要なパッケージをインストールしています...
    pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo パッケージのインストールに失敗しました。
        pause
        exit /b
    )
)

REM Run setup if database doesn't exist
if not exist data\snidan_monitor.db (
    echo データベースを初期化しています...
    python setup.py
    if %ERRORLEVEL% neq 0 (
        echo データベースの初期化に失敗しました。
        pause
        exit /b
    )
)

REM Start the application
echo アプリケーションを起動しています...
echo ブラウザで http://localhost:5000 にアクセスしてください。
echo.
echo 終了するには、このウィンドウを閉じるか、Ctrl+C を押してください。
echo.
python main.py

REM Deactivate virtual environment
call venv\Scripts\deactivate

pause 