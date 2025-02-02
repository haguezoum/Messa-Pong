# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tarzan <elakhfif@student.1337.ma>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/02 17:31:48 by tarzan            #+#    #+#              #
#    Updated: 2025/02/02 17:41:33 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM	alpine:3.19

ENV	REDIS_VERSION=7.2.4

RUN	apk update && apk add --no-cache \
	redis=${REDIS_VERSION}

COPY	redis.conf /usr/local/etc/redis/redis.conf

WORKDIR	/data

EXPOSE	6379/tcp

CMD	[ "redis-server", "/usr/local/etc/redis/redis.conf" ]
