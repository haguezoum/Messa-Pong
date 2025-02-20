FROM	docker.elastic.co/logstash/logstash:8.15.3

ENV	PATH=/usr/share/logstash/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

USER	root

RUN	apt-get update && \
	apt-get install -y --no-install-recommends curl jq && \
	apt-get clean && rm -rf /var/lib/apt/lists/* 

COPY	./tools/entrypoint.sh entrypoint.sh

RUN	install -o logstash -g logstash -m 755 entrypoint.sh /usr/local/bin/entrypoint.sh

COPY	./configuration/logstash.conf /usr/share/logstash/pipeline/logstash.conf

USER	logstash

EXPOSE	9600/tcp

CMD	["/usr/local/bin/entrypoint.sh"]
