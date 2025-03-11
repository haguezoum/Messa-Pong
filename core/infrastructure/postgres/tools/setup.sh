#!/bin/sh

set -e

# Initialize PostgreSQL data directory
PGDATA="/var/lib/postgresql/data"

# Ensure run directory exists and has correct permissions
mkdir -p /run/postgresql
chmod 700 /run/postgresql

# Initialize PostgreSQL data directory if it's empty
if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    initdb -D "$PGDATA"
    
    # Configure PostgreSQL
    cat >> "$PGDATA/postgresql.conf" <<EOF
listen_addresses = '*'
max_connections = 100
shared_buffers = 128MB
EOF

    # Configure authentication
    cat > "$PGDATA/pg_hba.conf" <<EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all            all                                     trust
host    all            all             127.0.0.1/32           md5
host    all            all             ::1/128                 md5
host    all            all             0.0.0.0/0              md5
EOF

    # Start PostgreSQL temporarily
    pg_ctl -D "$PGDATA" -w start

    # Create user and database (only if they don't exist)
    psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" <<-EOSQL
        ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB') THEN
                CREATE DATABASE $POSTGRES_DB WITH OWNER $POSTGRES_USER;
            END IF;
        END
        \$\$;
        GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

    # Stop PostgreSQL
    pg_ctl -D "$PGDATA" -m fast -w stop
fi

echo "Starting PostgreSQL server..."
exec postgres -D "$PGDATA"
