FROM	prom/node-exporter:latest

#we keep it as root for now untill we see if possible to remove it
USER	root

EXPOSE	9100/tcp

CMD	["--path.rootfs=/host", "--path.procfs=/host/proc", "--path.sysfs=/host/sys", "--collector.os=false"]
