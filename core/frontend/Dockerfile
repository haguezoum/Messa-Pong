FROM		alpine:3.19

RUN		apk add --no-cache inotify-tools bash 

WORKDIR		/www

COPY		. /www

RUN		chmod +x /www/watch.sh

ENTRYPOINT	[ "sh", "/www/watch.sh" ]

CMD		[ "tail", "-f", "/dev/null" ]
