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

RUN		apk update && apk add --no-cache nginx \
		openssl curl && rm -rf /var/cache/apk/* 

RUN 		mkdir -p /www /etc/nginx/ssl /var/log/nginx /run/nginx && \
		chown -R nginx:nginx /var/log/nginx /run/nginx /www /etc/nginx/ssl 

COPY		./configuration/http.conf /etc/nginx/nginx.conf
COPY		./configuration/default.conf /etc/nginx/http.d/default.conf
COPY		./tools/launcher.sh /

RUN		chmod +x /launcher.sh && \
		ln -sf /dev/stdout /var/log/nginx/access.log && \
		ln -sf /dev/stderr /var/log/nginx/error.log

USER		nginx

EXPOSE		80/tcp 443/tcp

ENTRYPOINT	[ "sh", "./launcher.sh" ]
