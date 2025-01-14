#!/bin/bash

initialize_db() {
    sleep 5
    /usr/lib/postgresql/??/bin/initdb /var/lib/postgresql/data
    /usr/lib/postgresql/??/bin/pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/logfile start
}

get_secrets() {
    local secret_key="$1"
    curl -H "X-Vault-Token: $VAULT_TOKEN" -X GET "http://vault:8200/v1/secret/data/${secret_key}" | jq -r ".data.data.${secret_key}"
}

create_db_and_user() {
    local db_name="$1"
    local user_name="$2"
    local user_pass="$3"

    echo "Creating database and user..."

    createdb -U postgres "$db_name"
    psql -U postgres -d "$db_name" -c "CREATE USER $user_name WITH PASSWORD '$user_pass';"
    psql -U postgres -d "$db_name" -c "ALTER USER postgres PASSWORD '$user_pass';"
    psql -U postgres -d "$db_name" -c "ALTER ROLE $user_name SET client_encoding TO 'utf8';"
    psql -U postgres -d "$db_name" -c "ALTER ROLE $user_name SET default_transaction_isolation TO 'read committed';"
    psql -U postgres -d "$db_name" -c "ALTER ROLE $user_name SET timezone TO 'UTC';"
    psql -U postgres -d "$db_name" -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $user_name;"
}

configure_postgres() {
    echo "Configuring PostgreSQL for external access..."

    killall postgres
    /usr/lib/postgresql/??/bin/pg_ctl -D /var/lib/postgresql/data stop
    echo "listen_addresses = '*'" >> /etc/postgresql/??/main/postgresql.conf
    echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf
    sed -i 's/127.0.0.1\/32/0.0.0.0\/0/g' /var/lib/postgresql/data/pg_hba.conf
    sed -i 's/127.0.0.1\/32/0.0.0.0\/0/g' /etc/postgresql/??/main/pg_hba.conf
    /usr/lib/postgresql/??/bin/postgres -D /var/lib/postgresql/data -c hba_file=/var/lib/postgresql/data/pg_hba.conf
}

initialize_db

POSTGRES_DB=$(get_secrets "POSTGRES_DB")
POSTGRES_PASS=$(get_secrets "POSTGRES_PASS")
POSTGRES_USER=$(get_secrets "POSTGRES_USER")

echo "L7WA $POSTGRES_DB, $POSTGRES_PASS, $POSTGRES_USER"

create_db_and_user "$POSTGRES_DB" "$POSTGRES_USER" "$POSTGRES_PASS"

configure_postgres
