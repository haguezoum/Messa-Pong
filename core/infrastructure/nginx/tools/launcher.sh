#!/bin/sh

SSLDIR="/etc/nginx/ssl"

[ -f "$SSLDIR/ssl.key" ] && [ -f "$SSLDIR/ssl.crt" ] || openssl req -new -x509 -nodes \
	-days 3650 -newkey rsa:2048 -keyout "$SSLDIR/ssl.key" -out "$SSLDIR/ssl.crt" -batch

exec nginx -g 'daemon off;'
