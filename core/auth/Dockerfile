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

FROM python:3.11-slim

SHELL ["/bin/bash", "-c"]

# Install system dependencies for Pillow and other packages
RUN apt-get update && apt-get install -y \
	wget \
	openssl \
	libjpeg-dev \
	zlib1g-dev \
	libfreetype6-dev \
	liblcms2-dev \
	libopenjp2-7-dev \
	libtiff5-dev \
	libharfbuzz-dev \
	libfribidi-dev \
	libxcb1-dev \
	gcc \
	libpq-dev \
	postgresql-client \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /api

COPY . /api

# Install Python packages with binary wheels when possible
RUN pip3 install --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

EXPOSE		8000/tcp

ENTRYPOINT	["bash", "./init.sh"]

