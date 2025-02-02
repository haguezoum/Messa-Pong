# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:01 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/02 15:20:19 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

RUN		apk update && apk add --no-cache \
    		nginx openssl \
    		gcc make musl-dev pcre-dev zlib-dev libtool autoconf automake wget curl git 

RUN		cd /tmp && \
		git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity.git && \
    		cd ModSecurity && \
    		git submodule init && \
    		git submodule update && \
    		./build.sh && \
    		./configure && \
    		make && \
    		make install 

RUN		cd /tmp && \
    		git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git 

RUN		cd /tmp && \
		wget http://nginx.org/download/nginx-1.24.0.tar.gz && \
		tar -zxvf nginx-1.24.0.tar.gz && \
		cd nginx-1.24.0 && \
		./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
		make modules && \
		cp objs/ngx_http_modsecurity_module.so /etc/nginx/ 

RUN		mkdir -p /etc/nginx/ssl /www && \
		openssl genrsa -out /etc/nginx/ssl/nginx.key 2048 && \
		openssl req -batch -new -key /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.csr && \
		openssl x509 -req -days 365 -in /etc/nginx/ssl/nginx.csr -signkey /etc/nginx/ssl/nginx.key -out /etc/nginx/ssl/nginx.crt

COPY		/configuration/default.conf /etc/nginx/http.d/default.conf

COPY		configuration/modsec.conf /etc/nginx/configuration/modsec.conf

COPY		modsecurity/crs /etc/nginx/modsec/

EXPOSE		80/tcp 443/tcp

ENTRYPOINT	[ "nginx", "-g", "daemon off;" ]
