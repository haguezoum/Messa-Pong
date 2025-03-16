#!/bin/bash
export PYTHONUNBUFFERED=1

# Wait for database
echo "[=] - waiting for database to start"
sleep 10

# Install requirements
pip install -r requirements.txt

# Run migrations
echo "[_] - making migrations"
python manage.py makemigrations
python manage.py migrate

# Create uploads directory and download default avatar
echo "[_] - creating uploads"
mkdir -p media/avatars
wget 'https://0x0.st/X4BZ.png' -O media/avatars/default.png

# Generate SSL certificates for development
echo "[_] - setting https certificates"
openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout /tmp/cert.key -out /tmp/cert.pem \
    -subj "/C=AT/ST=sbania/L=derbdban/O=lhorbax/CN=tnaflix.com"

# Start server
echo "[+] - starting the api"
if [[ "$API_DEBUG" == "True" ]]; then
    python manage.py runserver 0.0.0.0:8000
else 
    python manage.py runserver_plus 0.0.0.0:8000 \
        --cert-file /tmp/cert.pem \
        --key-file /tmp/cert.key
fi
