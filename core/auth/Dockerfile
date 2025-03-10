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

RUN		groupadd -r app && \
		useradd -r -g app -d /home/aet-tass -m aet-tass

WORKDIR		/home/aet-tass/app

COPY		--chown=aet-tass:app . .

RUN		chmod +x tools/launcher.sh && \
		pip install --no-cache-dir -r requirements.txt && \
		chown -R aet-tass:app /home/aet-tass

USER		aet-tass

EXPOSE		8000/tcp

CMD		["./tools/launcher.sh"]
