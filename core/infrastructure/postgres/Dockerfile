# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:57:10 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/19 11:23:25 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

COPY		./tools/setup.sh /setup.sh

RUN		apk add --no-cache postgresql curl jq su-exec && \
		install -do postgres -g postgres /var/lib/postgresql/data && \
		install -do postgres -g postgres /run/postgresql && chmod +x /setup.sh

USER		postgres

EXPOSE		5432/tcp

ENTRYPOINT	[ "sh", "/setup.sh" ]
