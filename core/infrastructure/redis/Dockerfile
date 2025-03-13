# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: tarzan <elakhfif@student.1337.ma>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/02 17:31:48 by tarzan            #+#    #+#              #
#    Updated: 2025/02/28 01:36:13 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM	alpine:3.19


RUN	apk update && apk add --no-cache redis

COPY	./configuration/redis.conf /usr/local/etc/redis/redis.conf

WORKDIR	/data

EXPOSE	6379/tcp

CMD	[ "redis-server", "/usr/local/etc/redis/redis.conf" ]
