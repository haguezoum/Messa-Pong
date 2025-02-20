#!/bin/sh

source /run/secrets/elk-credentials
set -e

log(){
	echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

http_request(){
	local method="$1"
	local url="$2"
	local data="${3:-}"
	local username="$ELASTICSEARCH_USERNAME"
	local password="$ELASTICSEARCH_PASSWD"

	if	[ -n "$data" ]; then
		curl -s -X "$method" "$url" \
			-H "Content-Type: application/json" \
			-u "$username:$password" \
			-d "$data"
	else
		curl -s -X "$method" "$url" -u "$username:$password"
	fi
}

vars=(ELASTIC_PASSWD ELASTICSEARCH_USERNAME KIBANA_USERNAME KIBANA_PASSWD ELASTICSEARCH_PASSWD)

for	var in "${vars[@]}"; do
	if [ -z "${!var}" ]; then
		log "ERROR: Required variable '$var' is missing in the secrets file"
		exit 1
	fi
done

log "Starting Elasticsearch..."
/usr/local/bin/docker-entrypoint.sh elasticsearch &

log "Waiting for Elasticsearch to become available..."
for	i in $(seq 1 300); do
	if	http_request GET "http://localhost:9200" >/dev/null; then
		log "Elasticsearch is ready!"
		break
	fi

	if	[ $i -eq 300 ]; then
		log "ERROR: Elasticsearch failed to start within 5 minutes"
		exit 1
	fi
	sleep 1
done

status_file="/usr/share/elasticsearch/data/.kibana_status/kibana_system_created"
if	[ ! -f "$status_file" ]; then
	log "Creating kibana_system user..."

	json_payload='{
		"password": "'"$KIBANA_PASSWD"'",
		"roles": ["kibana_system"],
		"full_name": "Kibana System User"
	}'

	response=$(http_request POST "http://localhost:9200/_security/user/$KIBANA_USERNAME" "$json_payload")

	if	[ $? -ne 0 ]; then
		log "ERROR: Failed to create kibana_system user"
		log "Response: $response"
		exit 1
	fi

	mkdir -p "$(dirname "$status_file")"
	touch "$status_file"
	chmod 600 "$status_file"
	log "Successfully created kibana_system user"
fi

log "Elasticsearch is fully initialized. Waiting for termination..."
wait
