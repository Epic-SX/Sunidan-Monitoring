#!/bin/bash

echo "スニダン価格監視アプリケーションを起動しています..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 がインストールされていません。"
    echo "Python 3.8 以上をインストールしてください: https://www.python.org/downloads/"
    echo
    read -p "Press Enter to exit..."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "仮想環境を作成しています..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "仮想環境の作成に失敗しました。"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if needed
if [ ! -d "venv/lib/python3.8/site-packages/flask" ] && [ ! -d "venv/lib/python3.9/site-packages/flask" ] && [ ! -d "venv/lib/python3.10/site-packages/flask" ]; then
    echo "必要なパッケージをインストールしています..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "パッケージのインストールに失敗しました。"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Create data directory if it doesn't exist
mkdir -p data

# Run setup if database doesn't exist
if [ ! -f "data/snidan_monitor.db" ]; then
    echo "データベースを初期化しています..."
    python setup.py
    if [ $? -ne 0 ]; then
        echo "データベースの初期化に失敗しました。"
        read -p "Press Enter to exit..."
        exit 1
    fi
fi

# Start the application
echo "アプリケーションを起動しています..."
echo "ブラウザで http://localhost:5000 にアクセスしてください。"
echo
echo "終了するには、Ctrl+C を押してください。"
echo

python main.py

# Deactivate virtual environment
deactivate 