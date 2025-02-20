#!/bin/bash

source /run/secrets/elk-credentials

log(){
	echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

export ELASTICSEARCH_USERNAME
export ELASTICSEARCH_PASSWD

log "Fetched ELASTICSEARCH_USERNAME and ELASTICSEARCH_PASSWD successfully"

log "Preparing Logstash pipeline configuration..."

sed -i -e "s/{{ELASTICSEARCH_USERNAME}}/${ELASTICSEARCH_USERNAME}/g" \
	-e "s/{{ELASTICSEARCH_PASSWD}}/${ELASTICSEARCH_PASSWD}/g" \
	/usr/share/logstash/pipeline/logstash.conf

if	[ ! -f /run/secrets/elk-credentials ] || [ ! -f /usr/share/logstash/pipeline/logstash.conf ]; then
	log "ERROR: Pipeline configuration file not found: /usr/share/logstash/pipeline/logstash.conf"
	exit 1
fi

log "Waiting for Elasticsearch to be ready..."
for	i in $(seq 1 300); do
	if curl -s "http://elasticsearch:9200" >/dev/null 2>&1; then
		log "Elasticsearch is ready!"
		break
	fi
	sleep 1
done

if	[ $i -eq 300 ]; then
	log "ERROR: Elasticsearch did not start within 5 minutes"
	exit 1
fi

log "Starting Logstash..."
exec /usr/share/logstash/bin/logstash -f /usr/share/logstash/pipeline/logstash.conf
