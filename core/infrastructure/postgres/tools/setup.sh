#!/bin/sh

set -e

# Initialize PostgreSQL data directory
PGDATA="/var/lib/postgresql/data"

# Ensure run directory exists and has correct permissions
mkdir -p /run/postgresql
chmod 700 /run/postgresql

# Initialize database if needed
if [ ! -s "${PGDATA}/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    initdb -D "${PGDATA}"
    
    # Modify pg_hba.conf to allow password authentication
    echo "host all all all md5" >> "${PGDATA}/pg_hba.conf"
    
    # Start PostgreSQL temporarily to create user and database
    pg_ctl -D "${PGDATA}" -o "-c listen_addresses='*'" -w start
    
    # Create user and database
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        CREATE DATABASE $POSTGRES_DB WITH OWNER $POSTGRES_USER;
        GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL
    
    # Stop PostgreSQL
    pg_ctl -D "${PGDATA}" -m fast -w stop
fi

echo "Starting PostgreSQL server..."
exec postgres -D "${PGDATA}" -c listen_addresses='*'
