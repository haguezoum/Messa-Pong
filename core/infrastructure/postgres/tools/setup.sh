#!/bin/sh

source /run/secrets/database-credentials

cat << EOF > init.sql
DO \$\$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE "$DB_NAME";
    END IF;
END \$\$;

DO \$\$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWD';
    END IF;
END \$\$;

GRANT ALL PRIVILEGES ON DATABASE "$DB_NAME" TO "$DB_USER";
ALTER USER "$DB_USER" WITH SUPERUSER;
EOF

su-exec postgres pg_ctl -D /var/lib/postgresql/data -l logfile start > /dev/null 2>&1 &
sleep 5

su-exec postgres psql -f init.sql

pg_ctl -D /var/lib/postgresql/data stop

rm -f init.sql

cat << 'EOF' > entrypoint.sh
#!/bin/sh
exec su-exec postgres pg_ctl -D /var/lib/postgresql/data -l logfile start && tail -f logfile
EOF

chmod +x entrypoint.sh

exec sh entrypoint.sh
