FROM		python:3.11-slim

ENV		PYTHONUNBUFFERED=1

WORKDIR		/rest_api

RUN		apt-get update && apt-get install -y \
		wget gcc libpq-dev netcat-openbsd && \
		rm -rf /var/lib/apt/lists/* 

COPY		requirements.txt .
COPY		. /rest_api
COPY		run.sh /rest_api/run.sh

RUN		pip install --no-cache-dir -r requirements.txt \
		&& chmod +x /rest_api/run.sh

EXPOSE		8000/tcp

ENTRYPOINT	[ "bash", "/rest_api/run.sh" ]
