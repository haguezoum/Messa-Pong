FROM		docker.elastic.co/elasticsearch/elasticsearch:8.15.3

ENV		discovery.type=single-node \
		cluster.name=elasticsearch \
		bootstrap.memory_lock=true \
		ES_JAVA_OPTS="-Xms512m -Xmx512m" \
		xpack.security.http.ssl.enabled=false \
		xpack.screenshotting.browser.chromium.disableSandbox=true \
		xpack.security.enabled=true \
		PATH=/usr/share/elasticsearch/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

USER		root

RUN		apt-get update && \
		apt-get install -y --no-install-recommends curl jq && \
		apt-get clean && rm -rf /var/lib/apt/lists/* 

COPY		tools/entrypoint.sh /usr/local/bin/entrypoint.sh

# RUN install -o elasticsearch -g elasticsearch -m 755 /tmp/entrypoint.sh /usr/local/bin/entrypoint.sh && \
#     rm -f /tmp/entrypoint.sh 
#
# RUN mkdir -p /usr/share/elasticsearch/data/.kibana_status && \
#     install -d -o elasticsearch -g elasticsearch -m 700 /usr/share/elasticsearch/data/.kibana_status

RUN chmod 755 /usr/local/bin/entrypoint.sh && \
    chown elasticsearch:elasticsearch /usr/local/bin/entrypoint.sh 

RUN mkdir -p /usr/share/elasticsearch/data/.kibana_status && \
    chown -R elasticsearch:elasticsearch /usr/share/elasticsearch/data/.kibana_status && \
    chmod 700 /usr/share/elasticsearch/data/.kibana_status

# RUN		install -o elasticsearch -g elasticsearch -m 755 /usr/local/bin/entrypoint.sh /usr/local/bin/entrypoint.sh && \
# 		install -do elasticsearch -g elasticsearch -m 700 /usr/share/elasticsearch/data/.kibana_status 

USER		elasticsearch

EXPOSE		9200/tcp

ENTRYPOINT	[ "/usr/local/bin/entrypoint.sh" ]
