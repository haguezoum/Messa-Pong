# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:56:09 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/21 17:12:35 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		python:3.10-slim

ENV		PYTHONUNBUFFERED=1 \
		PYTHONDONTWRITEBYTECODE=1 \
		DJANGO_SETTINGS_MODULE=restapi.settings

RUN		apt-get update -y && \
		apt-get install --no-install-recommends -y gcc libpq-dev postgresql-client && \
		rm -rf /var/lib/apt/lists/* 

RUN		useradd --create-home aet-tass

WORKDIR		/app

COPY		. /app/
RUN		chmod +x /app/tools/launcher.sh && \
		pip install --no-cache-dir -r requirements.txt && \
		chown -R aet-tass:aet-tass /app

USER		aet-tass

EXPOSE		8000/tcp

CMD		["/app/tools/launcher.sh"]
