FROM		python:3.11-slim

WORKDIR		/app

RUN		apt-get update && apt-get install -y \
		wget gcc libpq-dev netcat-openbsd && \
		rm -rf /var/lib/apt/lists/* 

COPY		. .

RUN		pip install --no-cache-dir -r requirements.txt \
		&& chmod +x run.sh

EXPOSE		8000/tcp

ENTRYPOINT	[ "./run.sh" ]
