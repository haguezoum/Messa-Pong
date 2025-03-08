#!/bin/sh

source /run/secrets/database-credentials
set -eo pipefail

: "${PG_NAME:?PG_NAME must be set}"
: "${PG_USER:?PG_USER must be set}"
: "${PG_PASSWD:?PG_PASSWD must be set}"

PG_BIN="/usr/bin"
DATA_DIR="/var/lib/postgresql/data"
SOCKET_DIR="/run/postgresql"

mkdir -p "${SOCKET_DIR}" && chown postgres:postgres "${SOCKET_DIR}"
mkdir -p "${DATA_DIR}" && chown postgres:postgres "${DATA_DIR}"

if [ -z "$(ls -A ${DATA_DIR})" ]; then
    echo "Initializing PostgreSQL database..."
    "${PG_BIN}/initdb" -U postgres -D "${DATA_DIR}" --locale=C.UTF-8
fi

echo "Starting PostgreSQL..."
if ! "${PG_BIN}/pg_ctl" -D "${DATA_DIR}" -l "${DATA_DIR}/logfile" -o "-k ${SOCKET_DIR}" start; then
    echo "Failed to start PostgreSQL. Reinitializing data directory..."
    rm -rf "${DATA_DIR}"/*
    "${PG_BIN}/initdb" -U postgres -D "${DATA_DIR}" --locale=C.UTF-8
    "${PG_BIN}/pg_ctl" -D "${DATA_DIR}" -l "${DATA_DIR}/logfile" -o "-k ${SOCKET_DIR}" start
fi

until "${PG_BIN}/pg_isready" -h "${SOCKET_DIR}"; do sleep 1; done

echo "Configuring database..."
if ! psql -h "${SOCKET_DIR}" -v ON_ERROR_STOP=1 -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${PG_NAME}';" | grep -q 1; then
    psql -h "${SOCKET_DIR}" -v ON_ERROR_STOP=1 -U postgres <<-EOSQL
        CREATE DATABASE ${PG_NAME};
        CREATE USER ${PG_USER} WITH PASSWORD '${PG_PASSWD}';
        ALTER USER ${PG_USER} WITH SUPERUSER;
        ALTER ROLE ${PG_USER} SET client_encoding = 'utf8';
	ALTER ROLE ${PG_USER} SET default_transaction_isolation TO 'read committed';
	ALTER ROLE ${PG_USER} SET timezone TO 'UTC';
	ALTER USER ${PG_USER} WITH PASSWORD '${PG_PASSWD}';
	ALTER USER ${PG_USER} WITH LOGIN;
	ALTER USER ${PG_USER} WITH CREATEDB;
	ALTER USER ${PG_USER} WITH CREATEROLE;
	ALTER USER ${PG_USER} WITH REPLICATION;
	ALTER USER ${PG_USER} WITH BYPASSRLS;
	ALTER USER ${PG_USER} WITH CONNECTION LIMIT -1;
	ALTER USER ${PG_USER} WITH INHERIT;
	GRANT ALL PRIVILEGES ON DATABASE ${PG_NAME} TO ${PG_USER};
	GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${PG_USER};
	GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${PG_USER};
	GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ${PG_USER};
EOSQL
else
	echo "Database '${PG_NAME}' already exists. Skipping creation."
fi

{
	echo "Restarting PostgreSQL with updated configuration..."
    
	"${PG_BIN}/pg_ctl" -D "${DATA_DIR}" stop

	echo "listen_addresses = '*'" >> "${DATA_DIR}/postgresql.conf"
	echo "host all all 0.0.0.0/0 scram-sha-256" >> "${DATA_DIR}/pg_hba.conf"
	exec "${PG_BIN}/postgres" -D "${DATA_DIR}" -k "${SOCKET_DIR}"
}
