# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:01 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/15 04:06:00 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

COPY		./tools/launcher.sh /

COPY		./index.html  /www/
COPY		./styles.css /www/
COPY		./configuration/default.conf /etc/nginx/http.d/default.conf

RUN		apk update && apk add --no-cache nginx \
		openssl && mkdir -p /www /etc/nginx/ssl && chmod +x launcher.sh && \
		ln -s /dev/stdout /var/log/nginx/access.log && \
		ln -s /dev/stderr /var/log/nginx/error.log && \
		rm -rf /var/cache/apk/*

EXPOSE		443/tcp 80/tcp

ENTRYPOINT	[ "sh", "./launcher.sh" ]
