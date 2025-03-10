#!/bin/sh

set -e

# Load environment variables from secrets
source /run/secrets/database-credentials

# Initialize PostgreSQL data directory
PGDATA="/var/lib/postgresql/data"
SOCKET_DIR="/run/postgresql"

# Create necessary directories
mkdir -p "${SOCKET_DIR}" && chown postgres:postgres "${SOCKET_DIR}"
mkdir -p "${PGDATA}" && chown postgres:postgres "${PGDATA}"

if [ ! -s "${PGDATA}/PG_VERSION" ]; then
    echo "Initializing PostgreSQL database..."
    su postgres -c "initdb -D ${PGDATA} --username=postgres --pwfile=<(echo \"${PG_PASSWD}\")"

    # Configure PostgreSQL
    cat >> "${PGDATA}/postgresql.conf" << EOF
listen_addresses = '*'
max_connections = 100
shared_buffers = 128MB
dynamic_shared_memory_type = posix
max_wal_size = 1GB
min_wal_size = 80MB
log_timezone = 'UTC'
datestyle = 'iso, mdy'
timezone = 'UTC'
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
default_text_search_config = 'pg_catalog.english'
EOF

    # Configure access
    cat >> "${PGDATA}/pg_hba.conf" << EOF
local   all             all                                     trust
host    all             all             127.0.0.1/32           md5
host    all             all             ::1/128                md5
host    all             all             0.0.0.0/0              md5
EOF
fi

# Start PostgreSQL
echo "Starting PostgreSQL server..."
su postgres -c "postgres -D ${PGDATA}"
