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

FROM		python:3.11-slim

ENV		PYTHONDONTWRITEBYTECODE=1 \
		PYTHONUNBUFFERED=1 \
		DJANGO_SETTINGS_MODULE=chat.settings

WORKDIR		/app

RUN		apt-get update && apt-get install -y --no-install-recommends \
		build-essential libpq-dev postgresql-client curl && \
		mkdir -p /app/static /app/staticfiles && \
		chmod -R 755 /app/static /app/staticfiles && \
		rm -rf /var/lib/apt/lists/* 

COPY		requirements.txt .

RUN		pip install --no-cache-dir -r requirements.txt && rm requirements.txt 

COPY		src/ .

COPY		./tools/entrypoint.sh .

RUN		chmod +x entrypoint.sh

EXPOSE		8002/tcp

ENTRYPOINT	["./entrypoint.sh"]
