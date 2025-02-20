# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: elakhfif <marvin@42.fr>                    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2024/11/26 07:56:09 by elakhfif          #+#    #+#              #
#    Updated: 2025/02/17 05:12:23 by elakhfif         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM		python:3.10-slim

ENV		PYTHONUNBUFFERED=1 \
		PYTHONDONTWRITEBYTECODE=1 \
		DJANGO_SETTINGS_MODULE=restapi.settings

RUN		apt-get update -y && \
		apt-get install --no-install-recommends -y gcc libpq-dev && \
		rm -rf /var/lib/apt/lists/* 

RUN		useradd --create-home tarzan 

USER		tarzan

WORKDIR		/home/tarzan/restapi

COPY		requirements.txt .

COPY		./tools/launcher.sh .

RUN		pip install --no-cache-dir -r requirements.txt

EXPOSE		8000/tcp

ENTRYPOINT ["/home/tarzan/restapi/launcher.sh"]
