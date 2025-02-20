#!/bin/bash

source /run/secrets/elk-credentials
set -e

log(){
	echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

required_vars="ELASTICSEARCH_USERNAME ELASTICSEARCH_PASSWD"
for	var in $required_vars; do
	if	[ -z "${!var}" ]; then
		log "ERROR: Required variable '$var' is missing in the secrets file"
		exit 1
	fi
done

export ELASTICSEARCH_USERNAME
export ELASTICSEARCH_PASSWD

log "Fetched ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWD successfully"

log "Preparing Kibana configuration..."
cat <<EOL > /usr/share/kibana/config/kibana.yml
server.host: "0.0.0.0"
elasticsearch.hosts: [ "http://elasticsearch:9200" ]
elasticsearch.username: "${ELASTICSEARCH_USERNAME}"
elasticsearch.password: "${ELASTICSEARCH_PASSWD}"
telemetry.enabled: false
EOL

log "Waiting for Elasticsearch to start..."
for	i in $(seq 1 300); do
	if	curl -s "http://elasticsearch:9200" >/dev/null 2>&1; then
		log "Elasticsearch is ready!"
		break
	fi
	sleep 1
done

if	[ $i -eq 300 ]; then
	log "ERROR: Elasticsearch did not start within 5 minutes"
	exit 1
fi

log "Starting Kibana..."
exec "$@"
