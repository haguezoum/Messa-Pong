# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:56:30 by elakhfif          #+#    #+#              #
#    Updated: 2024/11/26 07:56:41 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		python3.10-alpine AS base

RUN		apk add --no-cache openssl curl

FROM		base AS builder

WORKDIR		/app

COPY		pyproject.toml poetry.lock ./

RUN		pip install poetry && poetry config virtualenvs.create false \
		&& poetry install --no-dev --no-interaction --no-ansi

FROM		base AS release

WORKDIR		/app

COPY		--from=dependencies /app/.venv /venv

COPY		. /app

ENV		PYTHONUNBUFFERED=1 \
		PYTHONPATH=/app \
		PATH="/venv/bin:$PATH" \
		DJANGO_SETTINGS_MODULE=config.settings.production

EXPOSE		8002/tcp

ENTRYPOINT	["daphne", "config.asgi:application", "-b", "0.0.0.0", "-p", "8002"]
