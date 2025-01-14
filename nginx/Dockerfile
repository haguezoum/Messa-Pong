# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:01 by elakhfif          #+#    #+#              #
#    Updated: 2025/01/14 14:14:18 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

RUN		apk update && apk add --no-cache nginx openssl && \
		mkdir -p /etc/nginx/ssl /www && openssl genrsa --out /etc/nginx/ssl/nginx.key 2048 && \
		openssl req -batch -new -key /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.csr && \
		openssl x509 -req -days 365 -in /etc/nginx/ssl/nginx.csr \
		-signkey /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt

COPY		/configuration/default.conf /etc/nginx/http.d/default.conf

EXPOSE		443/tcp

ENTRYPOINT	[ "nginx", "-g", "daemon off;" ]
