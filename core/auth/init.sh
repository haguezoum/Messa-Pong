#!/bin/bash

export PYTHONUNBUFFERED=1
sleep 10

pip3 install -r requirements.txt > /dev/null

echo "[=] - waiting for postgresql to start"
sleep 5

echo "[_] - making migrations"
python3 manage.py makemigrations rest_api
cp -r rest_api/custom_migration.py rest_api/migrations/0002_admin_account.py

echo "[_] - making migrating"
python3 manage.py migrate

echo "[_] - creating uploads"
wget 'https://0x0.st/X4BZ.png' -O static/anon.png

echo "[+] - starting the api"
python3 manage.py runserver 0.0.0.0:8000
