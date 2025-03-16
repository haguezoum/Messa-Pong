FROM		python:3.11-slim

WORKDIR		/api

RUN		apt-get update && apt-get install -y \
		wget openssl gcc libpq-dev netcat-openbsd && \
		rm -rf /var/lib/apt/lists/*

RUN		python -m venv /venv

ENV		PATH="/venv/bin:$PATH"

COPY		requirements.txt .

RUN		pip install --no-cache-dir -r requirements.txt

COPY		. .

EXPOSE		8000/tcp

ENTRYPOINT	["bash", "run.sh"]
