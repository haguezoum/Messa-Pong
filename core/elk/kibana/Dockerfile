FROM		docker.elastic.co/kibana/kibana:8.15.3

ENV		ELASTICSEARCH_HOSTS=http://elasticsearch:9200 \
		TELEMETRY_ENABLED=false \
		server.host=0.0.0.0

USER		root

RUN		apt-get update -y > /dev/null && \
		apt-get install -y --no-install-recommends curl jq > /dev/null && \
		apt-get clean && rm -rf /var/lib/apt/lists/* 

COPY		./tools/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN		chmod +x /usr/local/bin/entrypoint.sh && \
		chown kibana:kibana /usr/local/bin/entrypoint.sh

USER		kibana

EXPOSE		5601/tcp

ENTRYPOINT	[ "/usr/local/bin/entrypoint.sh" ]

CMD		[ "kibana-docker" ]
