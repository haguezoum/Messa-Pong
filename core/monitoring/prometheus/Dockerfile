FROM	prom/prometheus:latest AS prometheus

COPY	configuration/prometheus.yml /etc/prometheus/prometheus.yml

EXPOSE	9090/tcp

CMD	["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.retention.time=7d", "--web.enable-lifecycle"]

