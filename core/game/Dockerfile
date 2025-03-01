# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:56:54 by elakhfif          #+#    #+#              #
#    Updated: 2024/11/26 07:56:58 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		alpine:3.19

RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-virtualenv \
    postgresql-client \
    build-base \
    libffi-dev \
    python3-dev \
    openssl-dev 


WORKDIR /app

COPY . ./

RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "ft_transcendence.asgi:application"]
