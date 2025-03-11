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

FROM		python:latest

SHELL		["/bin/bash", "-c"]

RUN		apt update -y && apt install wget openssl -y

WORKDIR /api

COPY . /api

RUN		pip3 install virtualenv && \
		python3 -m virtualenv /api && \
		python3 -m venv env && \
		source env/bin/activate

EXPOSE		8000/tcp

ENTRYPOINT	["bash", "./init.sh"]

