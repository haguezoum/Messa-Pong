# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:10 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/02 17:03:13 by tarzan           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

RUN		apk update && apk add --no-cache postgresql15 postgresql15-contrib && \
		install -do postgres -g postgres -m 700 /data /run/postgresql && \
		su-exec postgres initdb -D /var/lib/postgresql/data 

COPY		./tools/setup.sh /

RUN		chmod +x /setup.sh

EXPOSE		5432/tcp

ENTRYPOINT	[ "sh", "setup.sh" ]
