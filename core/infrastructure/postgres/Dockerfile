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

# Create postgres user and necessary directories if they don't exist
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    chmod 700 /var/lib/postgresql/data

COPY		--chown=postgres:postgres ./tools/setup.sh /setup.sh

RUN		chmod +x /setup.sh

USER		postgres
WORKDIR /var/lib/postgresql

VOLUME ["/var/lib/postgresql/data"]
EXPOSE		5432/tcp

# More robust health check
HEALTHCHECK --interval=5s --timeout=3s --retries=5 --start-period=10s \
  CMD pg_isready -U postgres -h localhost || exit 1

CMD ["/setup.sh"]
