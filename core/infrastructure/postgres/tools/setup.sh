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
    initdb -D "${PGDATA}" --auth=trust --username=postgres

    # Configure PostgreSQL
    cat > "${PGDATA}/postgresql.conf" << EOF
listen_addresses = '*'
port = 5432
max_connections = 100
shared_buffers = 128MB
dynamic_shared_memory_type = posix
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'all'
unix_socket_directories = '/run/postgresql'
EOF

    # Configure client authentication
    cat > "${PGDATA}/pg_hba.conf" << EOF
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all            all                                     trust
host    all            all             127.0.0.1/32           trust
host    all            all             ::1/128                trust
host    all            all             0.0.0.0/0              md5
EOF
fi

echo "Starting PostgreSQL server..."
exec postgres -D "${PGDATA}"
