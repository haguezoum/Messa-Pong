FROM		alpine:3.19

RUN		apk add --no-cache darkhttpd

WORKDIR		/www

COPY		. /www

EXPOSE		8080/tcp

ENTRYPOINT	[ "darkhttpd", ".", "--port", "8080" ]
