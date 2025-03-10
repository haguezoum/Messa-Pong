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

RUN		apk add --no-cache postgresql postgresql-contrib

COPY		./tools/setup.sh /setup.sh

RUN		chmod +x /setup.sh

USER		postgres

EXPOSE		5432/tcp

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD pg_isready -U postgres || exit 1

ENTRYPOINT	[ "/setup.sh" ]
