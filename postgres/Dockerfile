# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:10 by elakhfif          #+#    #+#              #
#    Updated: 2025/01/14 14:21:27 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

RUN		apk update --no-cache && apk add postgresql postgresql-contrib curl jq 


COPY		setup.sh /

RUN		chmod +x /setup.sh

USER		postgres

EXPOSE		5432/tcp

ENTRYPOINT	[ "sh", "setup.sh" ]
